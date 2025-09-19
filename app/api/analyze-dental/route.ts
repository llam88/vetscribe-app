import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { text, species = 'dog' } = await req.json()
    
    // Debug logging
    console.log('=== DENTAL ANALYSIS INPUT ===')
    console.log('Full text being analyzed:', text)
    console.log('Text length:', text.length)
    console.log('Species:', species)
    console.log('================================')

    const dentalPrompt = `
CRITICAL INSTRUCTION: You are analyzing veterinary notes and MUST extract ALL dental findings mentioned. Do NOT miss anything!

TEXT TO ANALYZE:
"${text}"

AGGRESSIVE EXTRACTION RULES:
1. Look for ANY mention of teeth, gums, mouth, dental conditions
2. Extract EVERY single dental finding, even minor ones
3. If you see words like: tartar, calculus, gingivitis, red gums, inflamed, broken, fractured, missing, loose, worn, decay, cleaning, scale, plaque, periodontal, pocket, abscess, crown, root - EXTRACT IT!
4. Don't be conservative - extract everything that could be dental-related

TOOTH MAPPING:
- Upper right quadrant: 101-110  
- Upper left quadrant: 201-211
- Lower left quadrant: 301-311  
- Lower right quadrant: 401-411
- If no specific tooth mentioned, use "general" or map to likely teeth (premolars 105-108, 205-208, 305-308, 405-408 for "back teeth", canines 104,204,304,404 for "canine teeth", etc.)

MANDATORY MAPPINGS - If you see these words, YOU MUST extract them:
- "tartar" or "calculus" → calculus
- "gingivitis" or "red gums" or "inflamed gums" → gingivitis
- "broken" or "fractured" or "chipped" → fracture  
- "missing" or "extracted" or "pulled" → missing
- "loose" → mobility
- "worn" → attrition
- "pocket" → periodontal_disease
- "cleaning" or "scale" → calculus (implies calculus present)
- "decay" or "cavity" → caries

EXAMPLES OF WHAT TO EXTRACT:
- "needs dental cleaning" → "general": "calculus" (cleaning implies calculus)
- "red inflamed gums" → "general": "gingivitis"  
- "tartar buildup on back teeth" → "105": "calculus", "106": "calculus", "107": "calculus", "108": "calculus"
- "fractured canine" → "104": "fracture" (assume upper right if not specified)
- "periodontal disease" → "general": "periodontal_disease"
- "dental issues" → "general": "calculus" (generic dental problems usually calculus)

Return JSON - DO NOT return empty findings unless there are truly NO dental mentions:
{
  "findings": {
    "tooth_number_or_general": "condition"
  },
  "summary": "What you found",
  "raw_extraction": "Exact phrases that led to findings"
}

EXTRACT EVERYTHING - Missing findings could harm the patient!
`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a veterinary dental specialist. Your CRITICAL mission is to extract EVERY SINGLE dental finding from notes - even minor mentions. NEVER return empty findings if ANY dental terms are mentioned. Be aggressive in extraction - it's better to over-extract than miss something that could affect patient care. If you see words like 'dental', 'teeth', 'gums', 'tartar', 'cleaning', 'gingivitis', etc. - you MUST extract findings."
        },
        {
          role: "user",
          content: dentalPrompt
        }
      ],
      temperature: 0.0, // Zero creativity - purely factual extraction
      max_tokens: 1000
    })

    const result = response.choices[0]?.message?.content || '{}'
    
    try {
      const parsedResult = JSON.parse(result)
      
      // Log the extraction for debugging
      console.log('Dental Analysis Results:', {
        originalText: text.substring(0, 300) + '...',
        extractedFindings: parsedResult.findings,
        findingsCount: Object.keys(parsedResult.findings || {}).length,
        summary: parsedResult.summary,
        rawExtraction: parsedResult.raw_extraction,
        aiRawResponse: result.substring(0, 500) + '...'
      })
      
      // Generate comprehensive dental chart data
      const chartData = generateDentalChartData(species, parsedResult.findings || {})
      
      return NextResponse.json({ 
        findings: parsedResult.findings || {},
        summary: parsedResult.summary || 'No specific dental findings documented',
        raw_extraction: parsedResult.raw_extraction || 'No extraction details',
        chartData,
        success: true 
      })
    } catch (parseError) {
      console.error('Error parsing dental analysis:', parseError)
      console.error('Raw AI response that failed to parse:', result)
      
      // Try to extract partial information even if JSON parsing failed
      const fallbackData = generateDentalChartData(species, {})
      
      return NextResponse.json({
        findings: {},
        summary: 'Unable to extract dental findings from notes - AI response parsing failed',
        raw_extraction: `Parse error: ${parseError}. Raw response: ${result}`,
        chartData: fallbackData,
        success: true, // Still return success with empty chart
        parseError: true
      })
    }

  } catch (error) {
    console.error('Error analyzing dental findings:', error)
    return NextResponse.json(
      { 
        error: `Failed to analyze dental findings: ${error instanceof Error ? error.message : String(error)}`,
        success: false
      },
      { status: 500 }
    )
  }
}

function generateDentalChartData(species: string, findings: Record<string, string>) {
  // Dental formulas for different species
  const teethLayouts = {
    dog: {
      upper_right: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'],
      upper_left: ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211'],
      lower_left: ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311'],
      lower_right: ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411']
    },
    cat: {
      upper_right: ['101', '102', '103', '104', '105', '106', '107', '108'],
      upper_left: ['201', '202', '203', '204', '205', '206', '207', '208'],
      lower_left: ['301', '302', '303', '304', '305', '306', '307'],
      lower_right: ['401', '402', '403', '404', '405', '406', '407']
    }
  }

  const layout = teethLayouts[species as keyof typeof teethLayouts] || teethLayouts.dog

  // Generate condition summary
  const conditions = {
    normal: 0,
    gingivitis: 0,
    calculus: 0,
    periodontal: 0,
    fracture: 0,
    missing: 0,
    other: 0
  }

  Object.values(findings).forEach(condition => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('gingivitis') || conditionLower.includes('inflamed') || conditionLower.includes('red gums')) conditions.gingivitis++
    else if (conditionLower.includes('calculus') || conditionLower.includes('tartar') || conditionLower.includes('scale')) conditions.calculus++
    else if (conditionLower.includes('pocket') || conditionLower.includes('periodontal')) conditions.periodontal++
    else if (conditionLower.includes('fracture') || conditionLower.includes('broken') || conditionLower.includes('chipped')) conditions.fracture++
    else if (conditionLower.includes('missing') || conditionLower.includes('extracted') || conditionLower.includes('pulled')) conditions.missing++
    else if (conditionLower === 'normal') conditions.normal++
    else conditions.other++
  })

  // Generate recommendations
  const recommendations = []
  
  if (conditions.gingivitis > 0) {
    recommendations.push({
      type: 'Gingivitis Management',
      count: conditions.gingivitis,
      description: 'Professional cleaning and improved home care recommended',
      urgency: 'medium'
    })
  }
  
  if (conditions.calculus > 0) {
    recommendations.push({
      type: 'Calculus Removal',
      count: conditions.calculus,
      description: 'Professional scaling required',
      urgency: 'medium'
    })
  }
  
  if (conditions.periodontal > 0) {
    recommendations.push({
      type: 'Periodontal Therapy',
      count: conditions.periodontal,
      description: 'May require root planing or surgical treatment',
      urgency: 'high'
    })
  }
  
  if (conditions.fracture > 0) {
    recommendations.push({
      type: 'Fracture Repair',
      count: conditions.fracture,
      description: 'Evaluate for extraction or restoration',
      urgency: 'high'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'Good Oral Health',
      count: 0,
      description: 'No significant dental pathology detected - Continue current home care routine',
      urgency: 'low'
    })
  }

  return {
    species,
    teeth_layout: layout,
    findings,
    conditions,
    recommendations,
    total_teeth: Object.values(layout).flat().length,
    affected_teeth: Object.keys(findings).length
  }
}
