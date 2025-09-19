"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  BookOpen,
  Stethoscope,
  Heart,
  Zap
} from "lucide-react"
import { defaultSOAPTemplates, templateCategories, type SOAPTemplate, type TemplateCategory } from "@/data/soap-templates"

interface SOAPTemplateManagerProps {
  onSelectTemplate?: (template: SOAPTemplate) => void
  showSelector?: boolean
}

export function SOAPTemplateManager({ onSelectTemplate, showSelector = false }: SOAPTemplateManagerProps) {
  const [templates, setTemplates] = useState<SOAPTemplate[]>(defaultSOAPTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SOAPTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<SOAPTemplate>>({
    name: "",
    category: "Custom",
    description: "",
    template: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: ""
    }
  })

  // Load custom templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('vetscribe-custom-templates')
    if (savedTemplates) {
      try {
        const customTemplates = JSON.parse(savedTemplates)
        setTemplates([...defaultSOAPTemplates, ...customTemplates])
      } catch (error) {
        console.error('Error loading custom templates:', error)
      }
    }
  }, [])

  const saveCustomTemplates = (allTemplates: SOAPTemplate[]) => {
    const customTemplates = allTemplates.filter(t => t.isCustom)
    localStorage.setItem('vetscribe-custom-templates', JSON.stringify(customTemplates))
  }

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      alert('Please fill in template name and description')
      return
    }

    const template: SOAPTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      category: newTemplate.category || 'Custom',
      description: newTemplate.description,
      template: newTemplate.template!,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTemplates = [...templates, template]
    setTemplates(updatedTemplates)
    saveCustomTemplates(updatedTemplates)
    
    // Reset form
    setNewTemplate({
      name: "",
      category: "Custom",
      description: "",
      template: {
        subjective: "",
        objective: "",
        assessment: "",
        plan: ""
      }
    })
    setShowCreateDialog(false)
  }

  const updateTemplate = () => {
    if (!editingTemplate) return

    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id 
        ? { ...editingTemplate, updatedAt: new Date().toISOString() }
        : t
    )
    setTemplates(updatedTemplates)
    saveCustomTemplates(updatedTemplates)
    setEditingTemplate(null)
  }

  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template && !template.isCustom) {
      alert('Cannot delete default templates')
      return
    }

    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      setTemplates(updatedTemplates)
      saveCustomTemplates(updatedTemplates)
    }
  }

  const duplicateTemplate = (template: SOAPTemplate) => {
    const duplicated: SOAPTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTemplates = [...templates, duplicated]
    setTemplates(updatedTemplates)
    saveCustomTemplates(updatedTemplates)
  }

  const exportTemplates = () => {
    const customTemplates = templates.filter(t => t.isCustom)
    const dataStr = JSON.stringify(customTemplates, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'vetscribe-templates.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTemplates = JSON.parse(e.target?.result as string)
        const updatedTemplates = [...templates, ...importedTemplates]
        setTemplates(updatedTemplates)
        saveCustomTemplates(updatedTemplates)
        alert(`Imported ${importedTemplates.length} templates successfully!`)
      } catch (error) {
        alert('Error importing templates. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Wellness': return <Heart className="h-4 w-4" />
      case 'Medical': return <Stethoscope className="h-4 w-4" />
      case 'Emergency': return <Zap className="h-4 w-4" />
      case 'Dental': return <BookOpen className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Wellness': return 'bg-green-100 text-green-800'
      case 'Medical': return 'bg-blue-100 text-blue-800'
      case 'Emergency': return 'bg-red-100 text-red-800'
      case 'Dental': return 'bg-purple-100 text-purple-800'
      case 'Surgery': return 'bg-orange-100 text-orange-800'
      case 'Specialty': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showSelector) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {templateCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                 onClick={() => onSelectTemplate?.(template)}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {getCategoryIcon(template.category)}
                  <span className="ml-1">{template.category}</span>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">SOAP Templates</h1>
          <p className="text-muted-foreground">
            Manage professional veterinary note templates for consistent documentation
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importTemplates}
            className="hidden"
            id="import-templates"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-templates')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={exportTemplates}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No templates match your search criteria' 
                  : 'Create your first custom template to get started'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryIcon(template.category)}
                        <span className="ml-1">{template.category}</span>
                      </Badge>
                      {template.isCustom && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{template.description}</p>
                    
                    {template.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                        {template.updatedAt && template.updatedAt !== template.createdAt && 
                          ` • Updated: ${new Date(template.updatedAt).toLocaleDateString()}`
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {template.isCustom && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New SOAP Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Puppy Wellness Exam"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value) => setNewTemplate(prev => ({...prev, category: value as TemplateCategory}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({...prev, description: e.target.value}))}
                placeholder="Brief description of when to use this template"
              />
            </div>

            <Tabs defaultValue="subjective" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="subjective">Subjective</TabsTrigger>
                <TabsTrigger value="objective">Objective</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjective" className="space-y-2">
                <Label htmlFor="subjective">Subjective Section</Label>
                <Textarea
                  id="subjective"
                  rows={8}
                  value={newTemplate.template?.subjective}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev, 
                    template: { ...prev.template!, subjective: e.target.value }
                  }))}
                  placeholder="Patient history, chief complaint, owner observations..."
                  className="font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="objective" className="space-y-2">
                <Label htmlFor="objective">Objective Section</Label>
                <Textarea
                  id="objective"
                  rows={8}
                  value={newTemplate.template?.objective}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev, 
                    template: { ...prev.template!, objective: e.target.value }
                  }))}
                  placeholder="Physical examination findings, vital signs, diagnostic results..."
                  className="font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="assessment" className="space-y-2">
                <Label htmlFor="assessment">Assessment Section</Label>
                <Textarea
                  id="assessment"
                  rows={8}
                  value={newTemplate.template?.assessment}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev, 
                    template: { ...prev.template!, assessment: e.target.value }
                  }))}
                  placeholder="Diagnosis, differential diagnoses, prognosis..."
                  className="font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="plan" className="space-y-2">
                <Label htmlFor="plan">Plan Section</Label>
                <Textarea
                  id="plan"
                  rows={8}
                  value={newTemplate.template?.plan}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev, 
                    template: { ...prev.template!, plan: e.target.value }
                  }))}
                  placeholder="Treatment plan, medications, follow-up instructions..."
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template: {editingTemplate.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                    disabled={!editingTemplate.isCustom}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingTemplate.category} 
                    onValueChange={(value) => setEditingTemplate(prev => prev ? {...prev, category: value as TemplateCategory} : null)}
                    disabled={!editingTemplate.isCustom}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate(prev => prev ? {...prev, description: e.target.value} : null)}
                  disabled={!editingTemplate.isCustom}
                />
              </div>

              <Tabs defaultValue="subjective" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="subjective">Subjective</TabsTrigger>
                  <TabsTrigger value="objective">Objective</TabsTrigger>
                  <TabsTrigger value="assessment">Assessment</TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                </TabsList>
                
                <TabsContent value="subjective" className="space-y-2">
                  <Label htmlFor="edit-subjective">Subjective Section</Label>
                  <Textarea
                    id="edit-subjective"
                    rows={8}
                    value={editingTemplate.template.subjective}
                    onChange={(e) => setEditingTemplate(prev => prev ? {
                      ...prev, 
                      template: { ...prev.template, subjective: e.target.value }
                    } : null)}
                    className="font-mono text-sm"
                    disabled={!editingTemplate.isCustom}
                  />
                </TabsContent>
                
                <TabsContent value="objective" className="space-y-2">
                  <Label htmlFor="edit-objective">Objective Section</Label>
                  <Textarea
                    id="edit-objective"
                    rows={8}
                    value={editingTemplate.template.objective}
                    onChange={(e) => setEditingTemplate(prev => prev ? {
                      ...prev, 
                      template: { ...prev.template, objective: e.target.value }
                    } : null)}
                    className="font-mono text-sm"
                    disabled={!editingTemplate.isCustom}
                  />
                </TabsContent>
                
                <TabsContent value="assessment" className="space-y-2">
                  <Label htmlFor="edit-assessment">Assessment Section</Label>
                  <Textarea
                    id="edit-assessment"
                    rows={8}
                    value={editingTemplate.template.assessment}
                    onChange={(e) => setEditingTemplate(prev => prev ? {
                      ...prev, 
                      template: { ...prev.template, assessment: e.target.value }
                    } : null)}
                    className="font-mono text-sm"
                    disabled={!editingTemplate.isCustom}
                  />
                </TabsContent>
                
                <TabsContent value="plan" className="space-y-2">
                  <Label htmlFor="edit-plan">Plan Section</Label>
                  <Textarea
                    id="edit-plan"
                    rows={8}
                    value={editingTemplate.template.plan}
                    onChange={(e) => setEditingTemplate(prev => prev ? {
                      ...prev, 
                      template: { ...prev.template, plan: e.target.value }
                    } : null)}
                    className="font-mono text-sm"
                    disabled={!editingTemplate.isCustom}
                  />
                </TabsContent>
              </Tabs>

              {!editingTemplate.isCustom && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 This is a default template. Use the duplicate button to create a customizable copy.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              {editingTemplate.isCustom && (
                <Button onClick={updateTemplate}>
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
