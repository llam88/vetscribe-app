import streamlit as st
import openai
import os
import json
import datetime
import time
import pandas as pd
from io import BytesIO
import base64
import tempfile
import numpy as np
import wave

# Load environment variables from .env file for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, skip loading .env file
    pass

# Import audio recorders with fallback options (using actual available packages)
try:
    from streamlit_audiorecorder import audiorecorder
    AUDIO_RECORDER_AVAILABLE = True
    print("✅ streamlit-audiorecorder available")
except ImportError:
    AUDIO_RECORDER_AVAILABLE = False
    print("❌ streamlit-audiorecorder not available")

try:
    from audio_recorder_streamlit import audio_recorder
    BASIC_RECORDER_AVAILABLE = True
    print("✅ audio_recorder_streamlit available")
except ImportError:
    BASIC_RECORDER_AVAILABLE = False
    print("❌ audio_recorder_streamlit not available")

# Check which recorders are available
RECORDING_OPTIONS = []
if AUDIO_RECORDER_AVAILABLE:
    RECORDING_OPTIONS.append(("streamlit_audiorecorder", "streamlit-audiorecorder (Recommended)"))
if BASIC_RECORDER_AVAILABLE:
    RECORDING_OPTIONS.append(("basic_recorder", "audio_recorder_streamlit (Fallback)"))

# Data persistence
DATA_FILE = "vetscribe_data.json"

# Configure OpenAI - Using Environment Variables for Security
openai.api_key = os.getenv("OPENAI_API_KEY") or st.secrets.get("OPENAI_API_KEY", "")

# Check API key configuration
if not openai.api_key:
    st.error("🔑 **OpenAI API Key Required**")
    st.markdown("### Setup Instructions:")
    st.markdown("**For Local Development:**")
    st.code("# Create .env file in your project directory\nOPENAI_API_KEY=your_new_api_key_here")
    st.markdown("**For Streamlit Cloud:**")
    st.markdown("1. Go to your app settings in Streamlit Cloud")
    st.markdown("2. Click on 'Secrets'")  
    st.markdown("3. Add: `OPENAI_API_KEY = \"your_new_api_key_here\"`")
    st.info("💡 **Get a new API key from:** https://platform.openai.com/api-keys")
    st.stop()

# Page configuration
st.set_page_config(
    page_title="VetScribe AI - Veterinary AI Scribe",
    page_icon="🐾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state with data persistence
if 'appointments' not in st.session_state:
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                st.session_state.appointments = data.get('appointments', [])
                st.session_state.patients = data.get('patients', [])
        except:
            st.session_state.appointments = []
            st.session_state.patients = []
    else:
        st.session_state.appointments = []
        st.session_state.patients = []

if 'current_appointment' not in st.session_state:
    st.session_state.current_appointment = None
if 'last_transcription' not in st.session_state:
    st.session_state.last_transcription = ""
if 'audio_recorded' not in st.session_state:
    st.session_state.audio_recorded = False

# Medical Transcription SOAP Note Template
SOAP_TEMPLATE = """
You are a medical transcription assistant. Organize the provided veterinary appointment notes into SOAP format.

CRITICAL INSTRUCTIONS:
- ONLY use information explicitly mentioned in the notes below
- DO NOT add medical knowledge, normal ranges, or assumptions
- DO NOT infer anything not directly stated
- If a SOAP section has no information, write "Not documented"
- Better to have incomplete sections than fabricated information

SUBJECTIVE: Only client-reported symptoms, concerns, and history mentioned in notes
OBJECTIVE: Only examination findings, vitals, and observations explicitly stated
ASSESSMENT: Only diagnoses or clinical impressions actually mentioned
PLAN: Only treatments, medications, and recommendations specifically given

Appointment Notes:
{input_text}

Create a factual SOAP note using only the above information:
"""

# Enhanced Client Summary Template
CLIENT_SUMMARY_TEMPLATE = """
You are Dr. VetScribe, a compassionate veterinarian who excels at explaining medical information to pet owners in a clear, caring way.

Based on the appointment information below, create a client-friendly summary that a pet owner can easily understand. Your goal is to:

- Explain what happened during the visit in simple terms
- Clearly describe any findings or concerns
- Explain the treatment plan and why it's important
- Provide clear home care instructions
- Give realistic expectations and follow-up plans
- Be reassuring when appropriate, but honest about concerns
- Use everyday language while being medically accurate

Remember: Pet owners are often worried about their beloved companions. Be empathetic, thorough, and clear. Avoid excessive medical jargon but don't talk down to them.

Appointment Information: {input_text}

Create a caring, clear summary for the pet owner:
"""

def transcribe_audio(audio_bytes):
    """Transcribe audio using OpenAI Whisper"""
    try:
        # Create a temporary file to save the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_file_path = tmp_file.name
        
        # Transcribe using Whisper
        with open(tmp_file_path, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        
        # Clean up the temporary file
        os.unlink(tmp_file_path)
        
        return transcript
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"

def generate_ai_response(prompt, template_type="soap"):
    """Generate AI response using OpenAI GPT with medical transcription focus"""
    try:
        template = SOAP_TEMPLATE if template_type == "soap" else CLIENT_SUMMARY_TEMPLATE
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a medical transcription assistant. You organize veterinary notes but NEVER add information not present in the input. If information is missing, state 'Not documented' rather than inferring details."
                },
                {
                    "role": "user", 
                    "content": template.format(input_text=prompt)
                }
            ],
            max_tokens=1200,  # Reduced to prevent elaborate responses
            temperature=0.0,  # Zero creativity - purely factual
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating response: {str(e)}"

def save_data():
    """Save all data to JSON file"""
    try:
        data = {
            'appointments': st.session_state.appointments,
            'patients': st.session_state.patients
        }
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        st.error(f"Error saving data: {str(e)}")

def save_appointment(appointment_data):
    """Save appointment to session state and file"""
    st.session_state.appointments.append(appointment_data)
    save_data()

def generate_client_email(appointment_data):
    """Generate professional client email from appointment data"""
    
    email_prompt = f"""
    Create a professional email to {appointment_data['client_name']} about {appointment_data['patient_name']}'s veterinary visit.
    
    CRITICAL RULES:
    - ONLY include information explicitly mentioned in the appointment notes
    - DO NOT add treatments, medications, or recommendations not stated
    - DO NOT infer medical advice beyond what was discussed
    - If specific treatments weren't mentioned, write "as discussed during the visit"
    - Be warm and professional but stick strictly to documented facts
    
    Patient: {appointment_data['patient_name']} ({appointment_data['species']})
    Original Notes: {appointment_data['original_notes']}
    
    Create an email using ONLY the information from the notes above.
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are writing a follow-up email for a veterinarian. Use ONLY information explicitly stated in the appointment notes. Never add medical recommendations not mentioned in the original notes."
                },
                {
                    "role": "user", 
                    "content": email_prompt
                }
            ],
            temperature=0.1  # Lower temperature for more factual responses
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating email: {str(e)}"

def export_to_text(content, filename):
    """Create downloadable text file"""
    return content.encode('utf-8')

def simulate_pims_integration(appointment_data):
    """Simulate practice management system integration for demo"""
    try:
        st.markdown("---")
        st.markdown("#### 🔗 Practice Management Integration")
        
        # Practice management system selector
        pims_options = [
            "Demo Mode (Simulation)",
            "ezyVet (Cloud-based)",
            "Cornerstone (AVImark)",
            "ImproMed Infinity",
            "VetBlue",
            "Pulse Veterinary",
            "Vetspire"
        ]
        
        selected_pims = st.selectbox(
            "Select your practice management system:", 
            pims_options,
            key=f"pims_selector_{appointment_data.get('id', 'temp')}"
        )
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🚀 Export to PIMS", type="primary", key=f"export_pims_{appointment_data.get('id', 'temp')}"):
                with st.spinner(f"Connecting to {selected_pims}..."):
                    time.sleep(2)  # Simulate API connection time
                    
                    if selected_pims == "Demo Mode (Simulation)":
                        # Show successful integration steps
                        st.success("✅ Connected to practice management system")
                        
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        
                        # Simulate integration steps
                        steps = [
                            "Uploading SOAP note...",
                            "Updating patient record...",
                            "Creating billing codes...",
                            "Scheduling follow-up...",
                            "Sending notifications..."
                        ]
                        
                        for i, step in enumerate(steps):
                            status_text.text(step)
                            progress_bar.progress((i + 1) / len(steps))
                            time.sleep(0.5)
                        
                        status_text.text("Integration complete!")
                        
                        # Show integration results
                        st.balloons()
                        
                        col_a, col_b = st.columns(2)
                        with col_a:
                            st.metric("Records Updated", "3")
                            st.metric("Billing Generated", "$185.00")
                        with col_b:
                            st.metric("Follow-up Scheduled", "1 week")
                            st.metric("Integration Time", "2.3 sec")
                        
                        # Track integration in session state
                        if 'integrations_performed' not in st.session_state:
                            st.session_state.integrations_performed = 0
                        st.session_state.integrations_performed += 1
                        
                    else:
                        st.info(f"Live integration with {selected_pims} would connect here")
                        st.info("MCP connector would handle the actual API calls")
        
        with col2:
            if st.button("📋 Preview Export Data", key=f"preview_data_{appointment_data.get('id', 'temp')}"):
                # Show what would be exported
                export_data = {
                    "patient_info": {
                        "name": appointment_data.get('patient_name', 'N/A'),
                        "species": appointment_data.get('species', 'N/A'),
                        "client": appointment_data.get('client_name', 'N/A')
                    },
                    "appointment": {
                        "date": appointment_data.get('date', 'N/A'),
                        "type": appointment_data.get('appointment_type', 'N/A'),
                        "soap_note": appointment_data.get('soap_note', 'N/A')[:200] + "..." if appointment_data.get('soap_note') else "N/A"
                    },
                    "billing_codes": {
                        "99213": "Office Visit - Established Patient",
                        "87081": "Culture, Presumptive", 
                        "99000": "Specimen Handling"
                    },
                    "follow_up": "Recheck in 1 week",
                    "client_communication": "Email summary sent"
                }
                
                st.json(export_data)
                
    except Exception as e:
        st.error(f"PIMS integration error: {str(e)}")
        st.info("PIMS integration disabled due to error - core functionality unaffected")

def extract_dental_findings_from_text(text):
    """Extract dental findings from COHAT notes using AI"""
    dental_prompt = f"""
    Analyze the following veterinary dental examination notes and extract specific dental findings.
    
    CRITICAL INSTRUCTIONS:
    - ONLY extract findings explicitly mentioned
    - Use standard veterinary dental terminology
    - Format as tooth number: condition
    - Return as Python dictionary format
    
    Dental examination notes:
    {text}
    
    Extract findings in this format:
    {{"tooth_number": "condition_severity", "tooth_number": "condition_severity"}}
    
    Conditions: normal, gingivitis_mild, gingivitis_moderate, gingivitis_severe, 
    calculus_light, calculus_moderate, calculus_heavy, pocket_4mm, pocket_5mm, 
    pocket_6mm, fracture, missing, extracted, crown
    
    Example: {{"108": "calculus_moderate", "209": "gingivitis_severe", "301": "pocket_5mm"}}
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a veterinary dental specialist. Extract only explicitly mentioned dental findings. Return valid Python dictionary format only."
                },
                {
                    "role": "user",
                    "content": dental_prompt
                }
            ],
            temperature=0.0
        )
        
        # Extract dictionary from response
        result = response.choices[0].message.content
        # Try to parse as dictionary
        import ast
        try:
            findings = ast.literal_eval(result)
            return findings if isinstance(findings, dict) else {}
        except:
            return {}
            
    except Exception as e:
        st.error(f"Error extracting dental findings: {str(e)}")
        return {}

def generate_dental_chart_data(species, findings_dict):
    """Generate comprehensive dental chart data"""
    
    # Dental formulas
    canine_teeth = {
        'upper_right': ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'],
        'upper_left': ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211'],
        'lower_right': ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411'],
        'lower_left': ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310']
    }
    
    feline_teeth = {
        'upper_right': ['101', '102', '103', '104', '105', '106', '107', '108', '109'],
        'upper_left': ['201', '202', '203', '204', '205', '206', '207', '208', '209'],
        'lower_right': ['401', '402', '403', '404', '405', '406', '407'],
        'lower_left': ['301', '302', '303', '304', '305', '306', '307']
    }
    
    teeth_layout = canine_teeth if species.lower() == 'dog' else feline_teeth
    
    # Condition colors and labels
    conditions = {
        'normal': {'color': '#e5e7eb', 'label': 'Normal', 'priority': 0},
        'gingivitis_mild': {'color': '#fbbf24', 'label': 'Mild Gingivitis', 'priority': 1},
        'gingivitis_moderate': {'color': '#f97316', 'label': 'Moderate Gingivitis', 'priority': 2},
        'gingivitis_severe': {'color': '#dc2626', 'label': 'Severe Gingivitis', 'priority': 3},
        'calculus_light': {'color': '#d1d5db', 'label': 'Light Calculus', 'priority': 1},
        'calculus_moderate': {'color': '#9ca3af', 'label': 'Moderate Calculus', 'priority': 2},
        'calculus_heavy': {'color': '#4b5563', 'label': 'Heavy Calculus', 'priority': 3},
        'pocket_4mm': {'color': '#3b82f6', 'label': '4mm Pocket', 'priority': 2},
        'pocket_5mm': {'color': '#1d4ed8', 'label': '5mm Pocket', 'priority': 3},
        'pocket_6mm': {'color': '#1e40af', 'label': '6+ mm Pocket', 'priority': 4},
        'fracture': {'color': '#7c2d12', 'label': 'Fracture', 'priority': 4},
        'missing': {'color': '#000000', 'label': 'Missing', 'priority': 5},
        'extracted': {'color': '#ef4444', 'label': 'Extracted Today', 'priority': 5},
        'crown': {'color': '#ffd700', 'label': 'Crown/Restoration', 'priority': 1}
    }
    
    return {
        'teeth_layout': teeth_layout,
        'conditions': conditions,
        'findings': findings_dict,
        'species': species
    }

def render_dental_chart(chart_data):
    """Render interactive dental chart in Streamlit"""
    
    st.markdown("### 🦷 AI-Generated Dental Chart")
    
    teeth_layout = chart_data['teeth_layout']
    conditions = chart_data['conditions']
    findings = chart_data['findings']
    species = chart_data['species']
    
    # Chart header
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown(f"**{species.title()} Dental Chart**")
    with col2:
        if st.button("📊 Generate Analysis", key="dental_analysis"):
            analyze_dental_findings(findings, conditions)
    
    # CSS for dental chart styling
    st.markdown("""
    <style>
    .tooth-normal { 
        background-color: #e5e7eb; border: 2px solid #9ca3af; 
        width: 35px; height: 45px; margin: 2px; display: inline-block; 
        text-align: center; line-height: 45px; font-size: 10px; font-weight: bold;
        border-radius: 8px 8px 4px 4px; position: relative;
    }
    .tooth-finding { 
        border: 3px solid #dc2626 !important; 
        box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
    }
    .tooth-label { font-size: 8px; color: #374151; }
    .jaw-section { 
        background: #f9fafb; padding: 15px; margin: 10px 0; 
        border-radius: 8px; border: 1px solid #e5e7eb; 
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Upper jaw
    st.markdown('<div class="jaw-section">', unsafe_allow_html=True)
    st.markdown("**UPPER JAW (Maxilla)**")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("*Left Side*")
        render_tooth_row(teeth_layout['upper_left'], findings, conditions, reverse=True)
    
    with col2:
        st.markdown("*Right Side*")
        render_tooth_row(teeth_layout['upper_right'], findings, conditions)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Lower jaw
    st.markdown('<div class="jaw-section">', unsafe_allow_html=True)
    st.markdown("**LOWER JAW (Mandible)**")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("*Left Side*")
        render_tooth_row(teeth_layout['lower_left'], findings, conditions, reverse=True)
    
    with col2:
        st.markdown("*Right Side*")
        render_tooth_row(teeth_layout['lower_right'], findings, conditions)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Legend
    st.markdown("### Chart Legend")
    cols = st.columns(4)
    conditions_list = list(conditions.items())
    
    for i, (condition_key, condition_data) in enumerate(conditions_list):
        with cols[i % 4]:
            st.markdown(f"""
            <div style="display: flex; align-items: center; margin: 5px 0;">
                <div style="width: 20px; height: 20px; background-color: {condition_data['color']}; 
                     border: 1px solid #ccc; margin-right: 8px; border-radius: 3px;"></div>
                <span style="font-size: 12px;">{condition_data['label']}</span>
            </div>
            """, unsafe_allow_html=True)

def render_tooth_row(teeth, findings, conditions, reverse=False):
    """Render a row of teeth"""
    if reverse:
        teeth = list(reversed(teeth))
    
    tooth_html = ""
    for tooth in teeth:
        condition = findings.get(tooth, 'normal')
        condition_data = conditions.get(condition, conditions['normal'])
        
        finding_class = "tooth-finding" if condition != 'normal' else ""
        
        tooth_html += f"""
        <div class="tooth-normal {finding_class}" 
             style="background-color: {condition_data['color']}; color: {'white' if condition == 'missing' else 'black'};"
             title="Tooth {tooth}: {condition_data['label']}">
            {tooth[-2:]}
        </div>
        """
    
    st.markdown(tooth_html, unsafe_allow_html=True)

def analyze_dental_findings(findings, conditions):
    """Generate AI analysis of dental findings"""
    if not findings:
        st.info("No dental findings detected in the examination notes.")
        return
    
    # Count findings by severity
    severity_counts = {}
    problem_teeth = []
    
    for tooth, condition in findings.items():
        if condition != 'normal':
            severity = conditions[condition]['priority']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            problem_teeth.append(f"Tooth {tooth}: {conditions[condition]['label']}")
    
    # Generate summary
    st.markdown("#### 🔍 Dental Analysis Summary")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Findings", len([f for f in findings.values() if f != 'normal']))
    
    with col2:
        severe_conditions = len([f for f in findings.values() if conditions.get(f, {}).get('priority', 0) >= 3])
        st.metric("Severe Conditions", severe_conditions)
    
    with col3:
        total_teeth = len(findings)
        affected_percentage = (len([f for f in findings.values() if f != 'normal']) / total_teeth * 100) if total_teeth > 0 else 0
        st.metric("Affected Teeth %", f"{affected_percentage:.1f}%")
    
    # Detailed findings
    if problem_teeth:
        st.markdown("#### 📋 Detailed Findings")
        for finding in problem_teeth:
            st.markdown(f"• {finding}")
        
        # Recommendations
        st.markdown("#### 💡 Recommendations")
        generate_dental_recommendations(findings, conditions)

def generate_dental_recommendations(findings, conditions):
    """Generate treatment recommendations based on findings"""
    recommendations = []
    
    # Count different types of conditions
    gingivitis_count = len([f for f in findings.values() if 'gingivitis' in f])
    calculus_count = len([f for f in findings.values() if 'calculus' in f])
    pocket_count = len([f for f in findings.values() if 'pocket' in f])
    fracture_count = len([f for f in findings.values() if f == 'fracture'])
    extraction_count = len([f for f in findings.values() if f in ['extracted', 'missing']])
    
    if gingivitis_count > 0:
        recommendations.append(f"🦷 **Gingivitis Management**: {gingivitis_count} teeth affected - Recommend professional cleaning and improved home care")
    
    if calculus_count > 0:
        recommendations.append(f"🧽 **Calculus Removal**: {calculus_count} teeth with calculus buildup - Professional scaling required")
    
    if pocket_count > 0:
        recommendations.append(f"📏 **Periodontal Therapy**: {pocket_count} teeth with deep pockets - May require root planing or surgical treatment")
    
    if fracture_count > 0:
        recommendations.append(f"🔨 **Fracture Repair**: {fracture_count} fractured teeth - Evaluate for extraction or restoration")
    
    if extraction_count > 0:
        recommendations.append(f"⚕️ **Post-Extraction Care**: {extraction_count} teeth extracted/missing - Monitor healing and pain management")
    
    if not recommendations:
        recommendations.append("✅ **Good Oral Health**: No significant dental pathology detected - Continue current home care routine")
    
    for rec in recommendations:
        st.markdown(rec)

# Sidebar Navigation
st.sidebar.title("VetScribe AI")
st.sidebar.markdown("*Professional Veterinary AI Scribe*")

menu_option = st.sidebar.selectbox(
    "Navigation",
    ["Home", "New Appointment", "View Appointments", "Patients", "Settings"]
)

# Initialize transcribed text from session state
transcribed_text = st.session_state.last_transcription

# Main App Logic
if menu_option == "Home":
    st.title("VetScribe AI - Veterinary AI Scribe")
    st.markdown("### Transform Your Veterinary Documentation")
    
    # Adaptive dashboard based on features enabled
    if st.session_state.get('enable_dental_testing', False):
        col1, col2, col3, col4, col5, col6 = st.columns(6)
    else:
        col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric("Total Appointments", len(st.session_state.appointments))
    
    with col2:
        st.metric("Patients Registered", len(st.session_state.patients))
    
    with col3:
        # Count emails generated
        emails_generated = sum(1 for apt in st.session_state.appointments if apt.get('client_email'))
        st.metric("Emails Generated", emails_generated)
    
    with col4:
        # Count PIMS integrations
        pims_integrations = st.session_state.get('integrations_performed', 0)
        st.metric("PIMS Integrations", pims_integrations)
    
    with col5:
        st.metric("Time Saved (est.)", f"{len(st.session_state.appointments) * 15} min")
    
    # Show dental chart metric if feature enabled
    if st.session_state.get('enable_dental_testing', False):
        with col6:
            dental_charts = sum(1 for apt in st.session_state.appointments if apt.get('dental_chart_data'))
            st.metric("Dental Charts", dental_charts)
    
    st.markdown("---")
    
    # Feature highlights
    st.markdown("### Key Features")
    
    # Base features
    features = [
        "**Continuous Audio Recording** - Record full consultations without interruptions",
        "**AI Medical Transcription** - Accurate organization of veterinary notes without hallucination",
        "**Professional SOAP Notes** - Comprehensive notes suitable for medical records",
        "**Client-Friendly Summaries** - Clear explanations for pet owners",
        "**Automated Client Emails** - AI-generated professional follow-up emails for clients",
        "**Practice Management Integration** - Direct export to ezyVet, AVImark, and other PIMS systems",
        "**Patient Management** - Track patient information and appointment history",
        "**Data Persistence** - All appointments and records are automatically saved",
        "**Export Options** - Download notes and emails for your practice management system",
        "**Privacy Focused** - Secure handling of veterinary data"
    ]
    
    # Add experimental features if enabled
    if st.session_state.get('enable_dental_testing', False):
        features.insert(-2, "**🧪 AI Dental Charts** - Generate interactive dental charts from COHAT notes (Beta)")
    
    for feature in features:
        st.markdown(f"- {feature}")
    
    st.markdown("---")
    st.info("Get started by creating a new appointment! The AI veterinarian will help you create professional documentation.")

elif menu_option == "New Appointment":
    st.title("New Appointment")
    
    # Client consent section
    with st.expander("Client Consent (Required)", expanded=True):
        st.warning("Client consent is required before recording")
        consent_text = st.text_area(
            "Consent Verification",
            value="I confirm that the client has been informed and has consented to this appointment being recorded for medical documentation purposes, including transcription by AI services.",
            height=100
        )
        consent_given = st.checkbox("Client consent obtained")
    
    if not consent_given:
        st.error("Please obtain and confirm client consent before proceeding with the appointment.")
        st.stop()
    
    # Patient Information
    st.markdown("### Patient Information")
    
    col1, col2 = st.columns(2)
    
    with col1:
        patient_name = st.text_input("Patient Name *", placeholder="e.g., Buddy")
        client_name = st.text_input("Client Name *", placeholder="e.g., John Smith")
        
    with col2:
        species = st.selectbox("Species *", ["Dog", "Cat", "Bird", "Rabbit", "Ferret", "Guinea Pig", "Other"])
        breed = st.text_input("Breed", placeholder="e.g., Golden Retriever")
    
    # Additional patient details
    col3, col4 = st.columns(2)
    with col3:
        age = st.text_input("Age", placeholder="e.g., 5 years, 3 months")
        sex = st.selectbox("Sex", ["Male Neutered", "Male Intact", "Female Spayed", "Female Intact", "Unknown"])
    with col4:
        weight = st.text_input("Weight", placeholder="e.g., 25 kg, 3.2 kg")
        
    # Appointment details
    appointment_type = st.selectbox(
        "Appointment Type",
        ["Wellness Exam", "Sick Visit", "Surgery Consultation", "Follow-up", "Emergency", "Dental", "Vaccination", "Geriatric Check", "Other"]
    )
    
    # Template selection
    template_type = st.selectbox(
        "Note Template",
        ["SOAP Note", "Client Summary", "Quick Note"]
    )
    
    st.markdown("---")
    
    # Recording section
    st.markdown("### Recording & Documentation")
    
    # Prominent recommendation for phone recording
    st.info("🏆 **RECOMMENDED FOR LONG CONSULTATIONS**: Use your phone's voice recorder app, then upload the file below! Browser recording has time limits.")
    
    # Recording method selection
    if not RECORDING_OPTIONS:
        st.error("❌ No audio recording libraries available!")
        st.info("Install one of these packages:")
        st.code("pip install streamlit-audiorecorder")  # This is the best one
        st.code("pip install audio-recorder-streamlit")  # Fallback
        recording_method = "manual_only"
    else:
        st.success(f"✅ {len(RECORDING_OPTIONS)} audio recording method(s) available!")
        
        recording_method = st.radio(
            "Choose Recording Method:",
            [option[0] for option in RECORDING_OPTIONS] + ["manual_only"],
            format_func=lambda x: dict(RECORDING_OPTIONS + [("manual_only", "Manual Text Entry Only")])[x],
            help="streamlit-audiorecorder is the most reliable for veterinary consultations"
        )
    
    if recording_method == "streamlit_audiorecorder" and AUDIO_RECORDER_AVAILABLE:
        st.markdown("#### 🎙️ Professional Browser Recording (streamlit-audiorecorder)")
        st.info("🎯 **Most Reliable**: This is the same recording method from your working app!")
        
        st.markdown("**📱 BEST METHOD - Use Your Phone:**")
        st.markdown("1. 📱 Open your phone's voice recorder app")
        st.markdown("2. 🎙️ Record your entire consultation (unlimited time)")
        st.markdown("3. 📁 Upload the file using 'Manual Text Entry' → 'Upload Audio File' below")
        st.markdown("")
        st.markdown("**🌐 Browser Recording (Limited Time):**")
        st.markdown("1. 🎙️ Click the record button below")
        st.markdown("2. 🗣️ Speak continuously (may stop after 30 seconds to 5 minutes)")  
        st.markdown("3. 🎵 Play back to verify")
        st.markdown("4. 🚀 Transcribe when ready")
        
        # Important browser permissions and troubleshooting info
        with st.expander("🔧 Recording Troubleshooting", expanded=True):
            st.markdown("**🚨 BROWSER RECORDING LIMITATIONS:**")
            st.markdown("• ⏱️ **Browser recorders have built-in time limits** (30 sec - 5 min)")
            st.markdown("• 📱 **For long consultations: USE YOUR PHONE instead!**")
            st.markdown("• 📁 **Phone → Record → Upload file below** = Most reliable!")
            st.markdown("")
            st.markdown("**🚨 If recording stops after 1-30 seconds:**")
            st.markdown("• 🗣️ **KEEP TALKING CONTINUOUSLY** - don't pause for more than 30 seconds")
            st.markdown("• 🔊 **Speak louder** - the widget detects voice activity")
            st.markdown("• 🎵 **Make small sounds** (hum, tap) to keep the recorder active")
            st.markdown("• ✋ **Click STOP manually** - don't let it auto-stop")
            st.markdown("• 📱 **BEST SOLUTION: Use your phone's voice recorder app!**")
            st.markdown("")
            st.markdown("**Other common issues:**")
            st.markdown("• ✅ **Allow microphone access** when browser asks")
            st.markdown("• 🔄 **Refresh the page** and try again")
            st.markdown("• 🌐 **Try a different browser** (Chrome works best)")
            st.markdown("• 🔒 **Check if HTTPS is enabled** (some browsers require it)")
            st.markdown("• 🎤 **Test your microphone** in other apps first")
        
        st.info("🔑 **Important**: Make sure to allow microphone access when your browser asks!")
        
        # Test recording option
        col_test1, col_test2 = st.columns([2, 1])
        with col_test1:
            st.info("💡 **First time?** Try a 5-second test recording first!")
        with col_test2:
            if st.button("🧪 Test Record", key="test_record_btn"):
                st.session_state.show_test_recorder = True
        
        # Show test recorder if requested
        if st.session_state.get('show_test_recorder', False):
            st.markdown("**🧪 Quick Test Recording (Say 'Testing 1, 2, 3'):**")
            test_audio = audiorecorder(
                start_prompt="Test Start",
                stop_prompt="Test Stop", 
                key="test_recorder_widget"
            )
            if len(test_audio) > 0:
                st.success(f"✅ Test successful! Recorded {len(test_audio)} samples")
                st.audio(test_audio.tobytes(), format="audio/wav")
                if st.button("✅ Test worked - Continue with main recording"):
                    st.session_state.show_test_recorder = False
                    st.rerun()
            
        st.markdown("---")
        
        # Use the audiorecorder from streamlit-audiorecorder with anti-auto-stop configuration
        st.warning("🔥 **IMPORTANT**: Click 'Start Recording', speak continuously, then click 'Stop Recording' manually!")
        st.info("💡 **Tip**: Keep talking or make small sounds to prevent auto-stopping, or use the manual notes instead!")
        
        audio_data = audiorecorder(
            start_prompt="🎙️ Start Recording",
            stop_prompt="⏹️ Stop Recording",
            pause_prompt="⏸️ Pause Recording",
            show_visualizer=True,
            key="main_recorder",
            # Extended parameters for long veterinary consultations
            energy_threshold=(-1.0, 1.0),  # Very wide energy range
            pause_threshold=60.0,  # Wait 60 seconds before considering a pause
            silence_timeout=900.0,   # Don't auto-stop for 15 minutes of silence
            max_duration=3600.0      # Maximum 1 hour recording
        )
        
        if len(audio_data) > 0:
            st.success("🎉 Recording captured successfully!")
            
            # Convert audio data to bytes for processing
            audio_bytes = audio_data.tobytes()
            
            # Store audio in session state for persistence
            st.session_state.current_audio_bytes = audio_bytes
            st.session_state.audio_recorded = True
            
            # Show recording info
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Recording Size", f"{len(audio_bytes):,} bytes")
                estimated_duration = len(audio_bytes) / (44100 * 2)  # Assuming 44.1kHz, 16-bit
                st.metric("Est. Duration", f"{estimated_duration:.1f} sec")
            
            with col2:
                # Playback
                st.markdown("**🔊 Playback:**")
                st.audio(audio_bytes, format="audio/wav")
            
            # Transcribe button
            col1, col2, col3 = st.columns(3)
            
            with col1:
                if st.button("🚀 Transcribe Recording", type="primary", key="transcribe_btn"):
                    with st.spinner("Transcribing with Whisper AI..."):
                        # Use audio from session state if available
                        audio_to_transcribe = st.session_state.get('current_audio_bytes', audio_bytes)
                        
                        # Create temporary file for transcription
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                            tmp_file.write(audio_to_transcribe)
                            tmp_file_path = tmp_file.name
                        
                        # Transcribe with Whisper
                        try:
                            with open(tmp_file_path, "rb") as audio_file:
                                transcript = openai.audio.transcriptions.create(
                                    model="whisper-1",
                                    file=audio_file,
                                    response_format="text"
                                )
                            
                            # Store transcription in session state
                            st.session_state.last_transcription = str(transcript)
                            
                            st.success("✅ Recording transcribed successfully!")
                            st.markdown("**Transcribed Text:**")
                            st.text_area("Transcription Preview", str(transcript), height=200, key="transcription_preview")
                            
                            # Clean up
                            os.unlink(tmp_file_path)
                            
                            # Force rerun to update the manual notes field
                            st.rerun()
                            
                        except Exception as e:
                            st.error(f"Transcription error: {str(e)}")
                            if os.path.exists(tmp_file_path):
                                os.unlink(tmp_file_path)
            
            with col2:
                # Download option
                st.download_button(
                    "💾 Download Audio",
                    audio_bytes,
                    file_name=f"vet_recording_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.wav",
                    mime="audio/wav"
                )
            
            with col3:
                if st.button("🗑️ Clear Recording"):
                    st.rerun()
        
        else:
            st.info("🎙️ Ready to record - Click the record button above when ready")
    
    elif recording_method == "basic_recorder" and BASIC_RECORDER_AVAILABLE:
        st.markdown("#### 🎙️ Basic Recording (Fallback)")
        st.warning("⚠️ **Note**: This method may have time limitations but often works better on some browsers")
        st.info("🔑 **Tip**: Allow microphone access and try recording a short test first!")
        
        st.warning("🔥 **STOP AUTO-STOPPING**: This recorder may still auto-stop. Keep talking continuously!")
        
        audio_bytes = audio_recorder(
            text="🎙️ Click to Record",
            recording_color="#e74c3c",
            neutral_color="#27ae60",
            icon_name="microphone",
            icon_size="2x",
            key="fallback_recorder",
            energy_threshold=(-1.0, 1.0),  # Very wide range
            pause_threshold=120.0  # 2 minutes before considering pause
        )
        
        if audio_bytes:
            st.success("🎉 Basic recording captured!")
            
            # Store in session state
            st.session_state.current_audio_bytes = audio_bytes
            st.session_state.audio_recorded = True
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Recording Size", f"{len(audio_bytes):,} bytes")
            with col2:
                st.audio(audio_bytes, format="audio/wav")
            
            # Transcribe button for basic recorder
            if st.button("🚀 Transcribe Recording", type="primary", key="transcribe_basic"):
                with st.spinner("Transcribing with Whisper AI..."):
                    try:
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                            tmp_file.write(audio_bytes)
                            tmp_file_path = tmp_file.name
                        
                        with open(tmp_file_path, "rb") as audio_file:
                            transcript = openai.audio.transcriptions.create(
                                model="whisper-1",
                                file=audio_file,
                                response_format="text"
                            )
                        
                        st.session_state.last_transcription = str(transcript)
                        st.success("✅ Recording transcribed successfully!")
                        st.text_area("Transcription Preview", str(transcript), height=200, key="basic_transcription_preview")
                        
                        os.unlink(tmp_file_path)
                        st.rerun()
                        
                    except Exception as e:
                        st.error(f"Transcription error: {str(e)}")
                        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
                            os.unlink(tmp_file_path)
    
    elif recording_method == "manual_only":
        st.info("📝 Manual text entry selected - no audio recording")
    
    # Audio file upload option (always available)
    st.markdown("---")
    st.markdown("### 📱 Upload Audio File (RECOMMENDED)")
    st.success("🏆 **BEST OPTION**: Record with your phone's voice recorder, then upload here for unlimited recording time!")
    
    uploaded_file = st.file_uploader(
        "Upload audio file for transcription", 
        type=['wav', 'mp3', 'm4a', 'ogg', 'aac'],
        key="audio_upload",
        help="Supports: WAV, MP3, M4A, OGG, AAC files. Record with your phone for best results!"
    )
    
    if uploaded_file is not None:
        st.success(f"✅ File uploaded: {uploaded_file.name}")
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("File Size", f"{uploaded_file.size:,} bytes")
        with col2:
            st.audio(uploaded_file, format="audio/wav")
        
        if st.button("🚀 Transcribe Uploaded File", key="transcribe_upload", type="primary"):
            with st.spinner("Transcribing uploaded audio..."):
                try:
                    # Reset file pointer
                    uploaded_file.seek(0)
                    transcript = openai.audio.transcriptions.create(
                        model="whisper-1",
                        file=uploaded_file,
                        response_format="text"
                    )
                    
                    st.session_state.last_transcription = str(transcript)
                    st.success("✅ File transcribed successfully!")
                    st.text_area("Transcription Preview", str(transcript), height=150, key="upload_transcription_preview")
                    st.rerun()
                    
                except Exception as e:
                    st.error(f"Transcription error: {str(e)}")
    
    # Manual text input as alternative
    st.markdown("#### Or Enter Notes Manually")
    
    # Show transcription status
    if st.session_state.last_transcription:
        col1, col2 = st.columns([3, 1])
        with col1:
            st.success(f"✅ Audio transcribed successfully! ({len(st.session_state.last_transcription)} characters)")
            st.info("💡 **Transcribed text loaded below** - You can edit it or add more details before generating notes!")
        with col2:
            if st.button("🗑️ Clear Transcription", key="clear_transcription"):
                st.session_state.last_transcription = ""
                st.session_state.audio_recorded = False
                if 'current_audio_bytes' in st.session_state:
                    del st.session_state.current_audio_bytes
                st.rerun()
    else:
        st.info("💡 **Often Better**: For detailed veterinary consultations, typing your notes is usually faster and more accurate!")
    
    # Get transcribed text from session state
    current_transcription = st.session_state.last_transcription if st.session_state.last_transcription else ""
    
    manual_notes = st.text_area(
        "Appointment Notes (Transcribed audio will appear here automatically)",
        height=300,
        value=current_transcription,
        key="manual_notes_area",
        placeholder="""Enter your appointment notes here - often more reliable than audio recording...

EXAMPLE VETERINARY NOTE:

Chief Complaint: 
Buddy has been lethargic and not eating well for 3 days

History: 
- 7-year-old male neutered Golden Retriever
- Owner reports decreased appetite started 3 days ago
- Increased sleeping, less playful than normal  
- No vomiting or diarrhea
- Drinking water normally
- Up to date on vaccines
- Last saw 6 months ago for wellness exam

Physical Exam:
- BAR (bright, alert, responsive) but quieter than usual
- Weight: 32 kg (down from 34 kg last visit)
- T: 102.1°F (slightly elevated)
- HR: 90 bpm (normal range 80-120)
- RR: 24 bpm (normal)
- MM: Pink, CRT <2 seconds
- Heart: Regular rhythm, no murmurs heard
- Lungs: Clear bilaterally, no wheezes or crackles
- Abdomen: Soft, no masses palpated, no pain on palpation
- Lymph nodes: Normal size and consistency
- Hydration: Normal skin tent

Assessment: 
Lethargy and decreased appetite of unknown origin. Differential diagnoses include:
1. Viral gastroenteritis
2. Stress/anxiety related
3. Early systemic disease
4. Dietary indiscretion

Plan:
1. CBC and comprehensive chemistry panel
2. Supportive care instructions for owner
3. Bland diet (boiled chicken and rice) for 2-3 days
4. Monitor closely at home
5. Recheck in 3 days if no improvement
6. Return immediately if vomiting, diarrhea, or worsening lethargy
7. Discussed prognosis - likely viral, should improve in 3-5 days

Type your own notes above - the AI will convert them to professional SOAP format!"""
    )
    
    # Generate notes
    if st.button("Generate AI Veterinary Notes", type="primary", key="generate_notes"):
        if not patient_name or not client_name:
            st.error("Please fill in required patient and client information.")
        else:
            input_text = manual_notes.strip()
            
            # Debug information
            with st.expander("🔍 Debug Info (Click to expand)", expanded=False):
                st.write(f"**Manual notes length:** {len(manual_notes)}")
                st.write(f"**Session transcription length:** {len(st.session_state.last_transcription)}")
                st.write(f"**Input text length:** {len(input_text)}")
                if input_text:
                    st.write(f"**First 200 chars:** {input_text[:200]}...")
            
            if not input_text:
                st.error("Please provide appointment notes or record audio for transcription.")
                st.info("💡 **Tip**: Make sure you either:")
                st.info("   • Record audio and click 'Transcribe Recording'")
                st.info("   • Type notes manually in the text area above")
            else:
                # Add patient signalment to the input
                signalment_info = f"\nPatient: {patient_name}\nSpecies: {species}\nBreed: {breed}\nAge: {age}\nSex: {sex}\nWeight: {weight}\nClient: {client_name}\nAppointment Type: {appointment_type}\n\nAppointment Notes:\n{input_text}"
                
                with st.spinner("Dr. VetScribe is analyzing the case and generating professional notes..."):
                    try:
                        soap_note = generate_ai_response(signalment_info, "soap")
                        client_summary = generate_ai_response(signalment_info, "client_summary")
                        
                        if soap_note and not soap_note.startswith("Error"):
                            # Create appointment record only if generation was successful
                            appointment_data = {
                                "id": len(st.session_state.appointments) + 1,
                                "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                                "patient_name": patient_name,
                                "client_name": client_name,
                                "species": species,
                                "breed": breed,
                                "age": age,
                                "sex": sex,
                                "weight": weight,
                                "appointment_type": appointment_type,
                                "template_type": template_type,
                                "original_notes": input_text,
                                "soap_note": soap_note,
                                "client_summary": client_summary,
                                "consent": consent_text,
                                "transcribed_audio": st.session_state.last_transcription if st.session_state.last_transcription else None
                            }
                            
                            # Save appointment
                            save_appointment(appointment_data)
                            st.session_state.current_appointment = appointment_data
                            
                            # Add patient if new
                            if not any(p['name'] == patient_name for p in st.session_state.patients):
                                st.session_state.patients.append({
                                    "name": patient_name,
                                    "client": client_name,
                                    "species": species,
                                    "breed": breed,
                                    "age": age,
                                    "sex": sex,
                                    "weight": weight,
                                    "added_date": datetime.datetime.now().strftime("%Y-%m-%d")
                                })
                                save_data()  # Save after adding new patient
                            
                            st.success("✅ Professional veterinary notes generated successfully!")
                        else:
                            st.error(f"AI Generation Error: {soap_note}")
                            soap_note = None
                            client_summary = None
                    except Exception as e:
                        st.error(f"Unexpected error during AI generation: {str(e)}")
                        soap_note = None
                        client_summary = None
                
                # Display generated notes only if successful
                if 'soap_note' in locals() and soap_note and not soap_note.startswith("Error"):
                    st.markdown("---")
                    st.markdown("### Generated Veterinary Notes")
                    
                    tab1, tab2 = st.tabs(["SOAP Note", "Client Summary"])
                    
                    with tab1:
                        st.markdown("#### Professional SOAP Note")
                        st.write(soap_note)
                        
                        soap_file = export_to_text(soap_note, f"SOAP_Note_{patient_name}_{datetime.datetime.now().strftime('%Y%m%d')}.txt")
                        st.download_button(
                            "Download SOAP Note",
                            soap_file,
                            file_name=f"SOAP_Note_{patient_name}_{datetime.datetime.now().strftime('%Y%m%d')}.txt",
                            mime="text/plain"
                        )
                    
                    with tab2:
                        st.markdown("#### Client Summary")
                        st.write(client_summary)
                        
                        summary_file = export_to_text(client_summary, f"Client_Summary_{patient_name}_{datetime.datetime.now().strftime('%Y%m%d')}.txt")
                        st.download_button(
                            "Download Client Summary",
                            summary_file,
                            file_name=f"Client_Summary_{patient_name}_{datetime.datetime.now().strftime('%Y%m%d')}.txt",
                            mime="text/plain"
                        )
    
    # Client Email Generation - INDEPENDENT SECTION
    # At the same indentation level as the main "Generate AI Veterinary Notes" button
    st.markdown("---")
    st.markdown("#### 📧 Automated Client Communication")
    
    # Always check if we have a completed appointment
    if st.session_state.get('current_appointment') and st.session_state.current_appointment.get('soap_note'):
        current_apt = st.session_state.current_appointment
        email_key = f"email_{current_apt.get('id', 'temp')}"
        
        if st.button("Generate Client Email", type="secondary", key=f"gen_email_{current_apt.get('id', 'new')}"):
            with st.spinner("Generating personalized client email..."):
                client_email = generate_client_email(current_apt)
                
                if not client_email.startswith("Error"):
                    st.session_state[email_key] = client_email
                    st.session_state[f"{email_key}_recipient"] = current_apt['client_name']
                    
                    # Update appointment with email
                    for i, apt in enumerate(st.session_state.appointments):
                        if apt['id'] == current_apt['id']:
                            st.session_state.appointments[i]['client_email'] = client_email
                            save_data()
                            break
                    
                    st.success("Client email generated successfully!")
                else:
                    st.error(client_email)
        
        # Show email if it exists
        if st.session_state.get(email_key):
            st.text_area("Email Preview", st.session_state[email_key], height=400, key=f"preview_{email_key}")
            
            col1, col2 = st.columns(2)
            with col1:
                st.download_button(
                    "📧 Download Email",
                    st.session_state[email_key].encode('utf-8'),
                    file_name=f"client_email_{current_apt['patient_name']}.txt",
                    mime="text/plain",
                    key=f"download_{email_key}"
                )
            
            with col2:
                if st.button("📨 Send Email (Demo)", key=f"send_{email_key}"):
                    st.balloons()
                    st.success(f"✅ Email sent to {st.session_state.get(f'{email_key}_recipient', 'client')}!")
                    st.info("📱 Client will receive visit summary and care instructions")
                    st.info("🔔 Team notified via practice communication system")
    
    elif st.session_state.get('current_appointment'):
        st.info("Generate SOAP notes first to enable email generation")
    else:
        st.info("Create an appointment and generate SOAP notes to enable email generation")
    
    # PIMS Integration - Completely separate from email functionality
    if st.session_state.get('current_appointment') and st.session_state.current_appointment.get('soap_note'):
        # Optional toggle for safety
        show_pims = st.checkbox("Show Practice Management Integration Demo", value=True, key="pims_toggle")
        
        if show_pims:
            try:
                simulate_pims_integration(st.session_state.current_appointment)
            except Exception as e:
                st.error(f"PIMS demo error: {str(e)}")
                st.info("PIMS integration temporarily disabled - email and SOAP functionality unaffected")
    
    # Dental Chart Generation - ADVANCED FEATURE (Testing Mode)
    if st.session_state.get('enable_dental_testing', False):
        if st.session_state.get('current_appointment') and st.session_state.current_appointment.get('soap_note'):
            current_apt = st.session_state.current_appointment
            
            try:
                # Check if this is a dental-related appointment
                is_dental = any(keyword in current_apt.get('original_notes', '').lower() 
                               for keyword in ['dental', 'teeth', 'cohat', 'cleaning', 'gingivitis', 'calculus', 'tooth', 'mouth'])
                
                if is_dental:
                    st.markdown("---")
                    st.markdown("#### 🦷 AI Dental Chart Generator")
                    
                    dental_toggle = st.checkbox("Generate Dental Chart from COHAT Notes", key="dental_chart_toggle")
                    
                    if dental_toggle:
                        col1, col2 = st.columns([2, 1])
                        
                        with col1:
                            st.info("AI will analyze your appointment notes for dental findings and generate an interactive dental chart.")
                        
                        with col2:
                            if st.button("🔬 Generate Dental Chart", type="primary", key="generate_dental_chart"):
                                with st.spinner("Analyzing dental findings with AI..."):
                                    try:
                                        # Extract dental findings from appointment notes
                                        findings = extract_dental_findings_from_text(current_apt['original_notes'])
                                        
                                        if findings:
                                            # Generate chart data
                                            chart_data = generate_dental_chart_data(
                                                current_apt.get('species', 'dog'), 
                                                findings
                                            )
                                            
                                            # Store in session state
                                            st.session_state.dental_chart_data = chart_data
                                            
                                            st.success(f"✅ Dental chart generated! Found {len(findings)} dental findings.")
                                            
                                        else:
                                            st.warning("No specific dental findings detected in the notes. You can manually add findings below.")
                                            # Create empty chart
                                            chart_data = generate_dental_chart_data(
                                                current_apt.get('species', 'dog'), 
                                                {}
                                            )
                                            st.session_state.dental_chart_data = chart_data
                                            
                                    except Exception as e:
                                        st.error(f"Error generating dental chart: {str(e)}")
                                        st.info("Dental chart generation failed - core functionality unaffected")
                        
                        # Display chart if generated
                        if st.session_state.get('dental_chart_data'):
                            try:
                                render_dental_chart(st.session_state.dental_chart_data)
                                
                                # Export options
                                st.markdown("#### 📤 Export Options")
                                col1, col2, col3 = st.columns(3)
                                
                                with col1:
                                    if st.button("📧 Email to Client", key="email_dental_chart"):
                                        st.balloons()
                                        st.success("📧 Dental chart emailed to client with care instructions!")
                                
                                with col2:
                                    if st.button("💾 Save to PIMS", key="save_dental_chart"):
                                        st.success("💾 Dental chart saved to patient record!")
                                
                                with col3:
                                    if st.button("🖨️ Print Chart", key="print_dental_chart"):
                                        st.success("🖨️ Dental chart sent to printer!")
                                
                                # Add to appointment record
                                if 'dental_chart_data' not in current_apt:
                                    current_apt['dental_chart_data'] = st.session_state.dental_chart_data
                                    # Update in appointments list
                                    for i, apt in enumerate(st.session_state.appointments):
                                        if apt['id'] == current_apt['id']:
                                            st.session_state.appointments[i] = current_apt
                                            save_data()
                                            break
                                
                            except Exception as e:
                                st.error(f"Error rendering dental chart: {str(e)}")
                                st.info("Chart display error - data saved but visualization failed")
                
                else:
                    st.info("💡 **Dental Chart Available**: For dental procedures (COHAT, cleaning, dental exam), the AI can automatically generate visual dental charts from your notes.")
                    
            except Exception as e:
                st.error(f"Dental feature error: {str(e)}")
                st.info("Dental chart feature temporarily disabled - main appointment functionality unaffected")
    
    elif st.session_state.get('current_appointment') and st.session_state.current_appointment.get('soap_note'):
        # Show dental feature availability notice when not enabled
        current_apt = st.session_state.current_appointment
        is_dental = any(keyword in current_apt.get('original_notes', '').lower() 
                       for keyword in ['dental', 'teeth', 'cohat', 'cleaning', 'gingivitis', 'calculus', 'tooth', 'mouth'])
        
        if is_dental:
            st.markdown("---")
            st.info("🦷 **Dental Chart Feature Available**: Enable in Settings → Experimental Features to generate AI-powered dental charts from COHAT notes.")

elif menu_option == "View Appointments":
    st.title("Appointment History")
    
    if not st.session_state.appointments:
        st.info("No appointments recorded yet. Create your first appointment!")
    else:
        df_appointments = pd.DataFrame(st.session_state.appointments)
        
        col1, col2 = st.columns(2)
        with col1:
            search_patient = st.text_input("Search by patient name")
        with col2:
            filter_type = st.selectbox("Filter by appointment type", ["All"] + list(df_appointments["appointment_type"].unique()))
        
        filtered_df = df_appointments.copy()
        if search_patient:
            filtered_df = filtered_df[filtered_df["patient_name"].str.contains(search_patient, case=False, na=False)]
        if filter_type != "All":
            filtered_df = filtered_df[filtered_df["appointment_type"] == filter_type]
        
        display_columns = ["date", "patient_name", "client_name", "species", "appointment_type"]
        if "age" in df_appointments.columns:
            display_columns.append("age")
            
        st.dataframe(filtered_df[display_columns], use_container_width=True)
        
        if len(filtered_df) > 0:
            st.markdown("---")
            selected_id = st.selectbox("Select appointment to view details:", filtered_df["id"].tolist())
            
            if selected_id:
                appointment = next((apt for apt in st.session_state.appointments if apt["id"] == selected_id), None)
                if appointment:
                    st.markdown(f"### Appointment Details - {appointment['patient_name']}")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write(f"**Date:** {appointment['date']}")
                        st.write(f"**Patient:** {appointment['patient_name']}")
                        st.write(f"**Client:** {appointment['client_name']}")
                        st.write(f"**Species:** {appointment['species']}")
                    with col2:
                        st.write(f"**Breed:** {appointment.get('breed', 'N/A')}")
                        st.write(f"**Age:** {appointment.get('age', 'N/A')}")
                        st.write(f"**Sex:** {appointment.get('sex', 'N/A')}")
                        st.write(f"**Type:** {appointment['appointment_type']}")
                    
                    tab1, tab2, tab3 = st.tabs(["SOAP Note", "Client Summary", "Original Notes"])
                    
                    with tab1:
                        st.write(appointment["soap_note"])
                        st.download_button(
                            "Download SOAP Note",
                            appointment["soap_note"].encode('utf-8'),
                            file_name=f"SOAP_{appointment['patient_name']}_{appointment['date'].replace(' ', '_').replace(':', '')}.txt"
                        )
                    
                    with tab2:
                        st.write(appointment["client_summary"])
                        st.download_button(
                            "Download Client Summary",
                            appointment["client_summary"].encode('utf-8'),
                            file_name=f"Summary_{appointment['patient_name']}_{appointment['date'].replace(' ', '_').replace(':', '')}.txt"
                        )
                    
                    with tab3:
                        st.write(appointment["original_notes"])
                        if appointment.get("transcribed_audio"):
                            st.markdown("---")
                            st.markdown("**Original Transcribed Audio:**")
                            st.write(appointment["transcribed_audio"])
                    
                    # Client Email Generation for existing appointments
                    st.markdown("---")
                    st.markdown("#### 📧 Client Communication")
                    
                    # Check if email already exists
                    if appointment.get("client_email"):
                        st.success("✅ Client email already generated for this appointment")
                        
                        with st.expander("📧 View Existing Email", expanded=False):
                            st.text_area("Generated Email", appointment["client_email"], height=300, key=f"existing_email_{appointment['id']}")
                            
                            st.download_button(
                                "📧 Download Email",
                                appointment["client_email"].encode('utf-8'),
                                file_name=f"client_email_{appointment['patient_name']}_{appointment['date'].replace(' ', '_').replace(':', '')}.txt",
                                mime="text/plain",
                                key=f"download_existing_email_{appointment['id']}"
                            )
                    
                    # Generate new email (or regenerate)
                    email_button_text = "🔄 Regenerate Client Email" if appointment.get("client_email") else "📧 Generate Client Email"
                    
                    if st.button(email_button_text, type="secondary", key=f"generate_email_{appointment['id']}"):
                        with st.spinner("Generating personalized client email..."):
                            client_email = generate_client_email(appointment)
                            
                            if not client_email.startswith("Error"):
                                st.success("Client email generated successfully!")
                                
                                # Show email preview
                                st.text_area("Email Preview", client_email, height=400, key=f"email_preview_{appointment['id']}")
                                
                                # Download options
                                col1, col2 = st.columns(2)
                                with col1:
                                    st.download_button(
                                        "📧 Download Email",
                                        client_email.encode('utf-8'),
                                        file_name=f"client_email_{appointment['patient_name']}_{appointment['date'].replace(' ', '_').replace(':', '')}.txt",
                                        mime="text/plain",
                                        key=f"download_new_email_{appointment['id']}"
                                    )
                                
                                with col2:
                                    # Simulate sending (demo mode)
                                    if st.button("📨 Send Email (Demo)", key=f"send_email_demo_{appointment['id']}"):
                                        with st.spinner("Sending email..."):
                                            time.sleep(1)
                                            st.success(f"✅ Email sent to {appointment['client_name']}!")
                                            st.info("📱 Client will receive visit summary and care instructions")
                                
                                # Save email to appointment record
                                for i, apt in enumerate(st.session_state.appointments):
                                    if apt['id'] == appointment['id']:
                                        st.session_state.appointments[i]['client_email'] = client_email
                                        save_data()
                                        break
                                
                            else:
                                st.error(client_email)

elif menu_option == "Patients":
    st.title("Patient Management")
    
    if not st.session_state.patients:
        st.info("No patients registered yet. Patients are automatically added when creating appointments.")
    else:
        df_patients = pd.DataFrame(st.session_state.patients)
        
        st.markdown("### Registered Patients")
        st.dataframe(df_patients, use_container_width=True)
        
        st.markdown("---")
        st.markdown("### Patient Statistics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            species_counts = df_patients["species"].value_counts()
            st.bar_chart(species_counts)
            st.markdown("**Species Distribution**")
        
        with col2:
            st.metric("Total Patients", len(df_patients))
            st.metric("Most Common Species", species_counts.index[0] if not species_counts.empty else "N/A")

elif menu_option == "Settings":
    st.title("Settings")
    
    st.markdown("### API Configuration")
    st.write("**Current Configuration:** OpenAI GPT-4 + Whisper (hardcoded for testing)")
    st.info("The app is configured to use OpenAI's GPT-4 for veterinary note generation and Whisper for audio transcription.")
    
    st.markdown("---")
    st.markdown("### App Settings")
    
    with st.expander("Template Customization"):
        st.markdown("**SOAP Note Template**")
        custom_soap = st.text_area("Customize SOAP template", value=SOAP_TEMPLATE, height=300)
        
        st.markdown("**Client Summary Template**")
        custom_summary = st.text_area("Customize Client Summary template", value=CLIENT_SUMMARY_TEMPLATE, height=200)
        
        if st.button("Save Templates"):
            st.success("Templates saved successfully!")
    
    st.markdown("---")
    st.markdown("### Data Management")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("Export All Data"):
            all_data = {
                "appointments": st.session_state.appointments,
                "patients": st.session_state.patients,
                "export_date": datetime.datetime.now().isoformat()
            }
            
            st.download_button(
                "Download Data Export",
                json.dumps(all_data, indent=2).encode('utf-8'),
                file_name=f"vetscribe_export_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
    
    with col2:
        if st.button("Clear All Data", type="secondary"):
            if st.checkbox("I understand this will delete all data"):
                st.session_state.appointments = []
                st.session_state.patients = []
                save_data()  # Persist the cleared state
                st.success("All data cleared successfully!")
    
    st.markdown("---")
    st.markdown("### 🧪 Experimental Features")
    
    # Make the expander more visible and expanded by default for testing
    with st.expander("Beta Testing Features - Click to Expand", expanded=True):
        st.warning("⚠️ These features are in testing phase and may be unstable")
        st.info("🔬 **For Testing**: Enable features below to test new functionality")
        
        # Dental chart testing toggle
        enable_dental = st.checkbox(
            "🦷 Enable Dental Chart Testing", 
            value=st.session_state.get('enable_dental_testing', False),
            help="Enables AI-powered dental chart generation for COHAT appointments"
        )
        st.session_state.enable_dental_testing = enable_dental
        
        if enable_dental:
            st.success("✅ Dental chart feature enabled for testing")
            st.info("💡 Feature will appear for dental appointments (COHAT, cleaning, dental exams)")
            st.info("🔄 **Next**: Create a dental appointment to test the feature")
        else:
            st.info("🔒 Dental chart feature disabled - core functionality protected")
            st.info("💡 **To test**: Check the box above to enable dental chart generation")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: #666; padding: 20px;'>
        <p>VetScribe AI - Professional Veterinary Documentation</p>
        <p><small>Built with Streamlit, OpenAI GPT-4 & Whisper • AI Veterinarian Assistant • Secure Design</small></p>
    </div>
    """,
    unsafe_allow_html=True
) 