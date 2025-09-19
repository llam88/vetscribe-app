"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Upload,
  FileText,
  Database,
  Calendar,
  Users,
  Mail,
  Smile,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Archive,
  FileSpreadsheet,
  FileJson,
} from "lucide-react"

const exportFormats = {
  json: { label: "JSON", icon: FileJson, description: "Complete data with full structure" },
  csv: { label: "CSV", icon: FileSpreadsheet, description: "Spreadsheet-compatible format" },
  pdf: { label: "PDF", icon: FileText, description: "Formatted reports for printing" },
}

const dataTypes = {
  patients: { label: "Patient Records", icon: Users, count: 324 },
  appointments: { label: "Appointments", icon: Calendar, count: 1247 },
  notes: { label: "SOAP Notes", icon: FileText, count: 847 },
  communications: { label: "Client Communications", icon: Mail, count: 523 },
  dental: { label: "Dental Charts", icon: Smile, count: 156 },
}

export function DataManagementSystem() {
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(Object.keys(dataTypes))
  const [selectedFormat, setSelectedFormat] = useState("json")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(dataType) ? prev.filter((type) => type !== dataType) : [...prev, dataType],
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportStatus("idle")

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const response = await fetch("/api/export-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataTypes: selectedDataTypes,
          format: selectedFormat,
          dateRange,
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `vet-practice-data-${new Date().toISOString().split("T")[0]}.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setExportStatus("success")
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      alert("Please select a file to import")
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", importFile)

      // Simulate import process
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const response = await fetch("/api/import-data", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Import failed")
      }

      setImportStatus("success")
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const generateBackup = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Create full backup
      for (let i = 0; i <= 100; i += 5) {
        setExportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const response = await fetch("/api/create-backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          includeAll: true,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Backup creation failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `vet-practice-backup-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setExportStatus("success")
    } catch (error) {
      console.error("Backup error:", error)
      setExportStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
          <p className="text-muted-foreground">Export, import, and backup your veterinary practice data.</p>
        </div>
        <Button onClick={generateBackup} disabled={isExporting} className="bg-primary hover:bg-primary/90">
          <Archive className="h-4 w-4 mr-2" />
          Create Full Backup
        </Button>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(exportFormats).map(([key, format]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <format.icon className="h-4 w-4" />
                              {format.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exportFormats[selectedFormat as keyof typeof exportFormats]?.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Date Range (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="date-from" className="text-xs">
                          From
                        </Label>
                        <Input
                          id="date-from"
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="date-to" className="text-xs">
                          To
                        </Label>
                        <Input
                          id="date-to"
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(dataTypes).map(([key, dataType]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <Checkbox
                        id={key}
                        checked={selectedDataTypes.includes(key)}
                        onCheckedChange={() => handleDataTypeToggle(key)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <dataType.icon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={key} className="flex-1">
                          {dataType.label}
                        </Label>
                        <span className="text-xs text-muted-foreground">{dataType.count} records</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Export Preview & Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Export Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Export Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium">
                          {exportFormats[selectedFormat as keyof typeof exportFormats]?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Types:</span>
                        <span className="font-medium">{selectedDataTypes.length} selected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Records:</span>
                        <span className="font-medium">
                          {selectedDataTypes.reduce(
                            (total, type) => total + dataTypes[type as keyof typeof dataTypes].count,
                            0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Range:</span>
                        <span className="font-medium">
                          {dateRange.from && dateRange.to ? `${dateRange.from} to ${dateRange.to}` : "All dates"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Exporting data...</span>
                      </div>
                      <Progress value={exportProgress} className="w-full" />
                      <p className="text-xs text-muted-foreground">{exportProgress}% complete</p>
                    </div>
                  )}

                  {exportStatus === "success" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Data exported successfully! The download should start automatically.
                      </AlertDescription>
                    </Alert>
                  )}

                  {exportStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Export failed. Please try again or contact support.</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleExport}
                      disabled={isExporting || selectedDataTypes.length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </>
                      )}
                    </Button>
                    <Button variant="outline" disabled={isExporting}>
                      Preview Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Import Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Select File</Label>
                  <Input id="import-file" type="file" accept=".json,.csv,.zip" onChange={handleFileSelect} />
                  <p className="text-xs text-muted-foreground mt-1">Supported formats: JSON, CSV, ZIP (backup files)</p>
                </div>

                {importFile && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <h4 className="font-medium mb-2">File Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span>{importFile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{(importFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{importFile.type || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Importing data...</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{importProgress}% complete</p>
                  </div>
                )}

                {importStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Data imported successfully! Your records have been updated.</AlertDescription>
                  </Alert>
                )}

                {importStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Import failed. Please check your file format and try again.</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">JSON Format</h4>
                    <p className="text-xs text-muted-foreground">
                      Complete data structure with all fields. Best for full data migration.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">CSV Format</h4>
                    <p className="text-xs text-muted-foreground">
                      Tabular data format. Each data type should be in a separate CSV file.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">ZIP Backup</h4>
                    <p className="text-xs text-muted-foreground">
                      Complete backup files created by this system. Includes all data types.
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Importing data will merge with existing records. Duplicate entries may
                    be created if the same data is imported multiple times.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-primary" />
                  Create Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a complete backup of all your veterinary practice data. This includes all patients,
                  appointments, notes, communications, and dental charts.
                </p>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Backup Contents</h4>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(dataTypes).map(([key, dataType]) => (
                      <li key={key} className="flex items-center gap-2">
                        <dataType.icon className="h-3 w-3" />
                        <span>{dataType.label}</span>
                        <span className="text-muted-foreground">({dataType.count} records)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={generateBackup}
                  disabled={isExporting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Create Full Backup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set up automatic backups to ensure your data is always protected.
                </p>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="backup-time">Backup Time</Label>
                    <Input id="backup-time" type="time" defaultValue="02:00" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" />
                    <Label htmlFor="email-notifications" className="text-sm">
                      Email backup notifications
                    </Label>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Save Backup Settings
                </Button>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>Last backup: Never. We recommend creating your first backup now.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
