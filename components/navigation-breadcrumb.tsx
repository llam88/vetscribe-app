"use client"
import Link from "next/link"
import { ChevronLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbProps {
  currentPage: string
  parentPage?: {
    name: string
    href: string
  }
}

export function NavigationBreadcrumb({ currentPage, parentPage }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      
      {parentPage && (
        <>
          <span className="text-muted-foreground">/</span>
          <Link href={parentPage.href}>
            <Button variant="ghost" size="sm">
              {parentPage.name}
            </Button>
          </Link>
        </>
      )}
      
      <span className="text-muted-foreground">/</span>
      <span className="font-medium">{currentPage}</span>
    </div>
  )
}
