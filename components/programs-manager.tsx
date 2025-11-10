"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Program {
  id: string
  name: string
  slug: string
  description: string
  image_url: string | null
  created_at: string
  updated_at: string
}

interface ProgramsManagerProps {
  programs: Program[]
}

export function ProgramsManager({ programs: initialPrograms }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProgram ? `/api/admin/programs/${editingProgram.id}` : "/api/admin/programs"

      const method = editingProgram ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: editingProgram ? "Program updated" : "Program created",
          description: "The program has been saved successfully",
        })

        if (editingProgram) {
          setPrograms((prev) => prev.map((p) => (p.id === editingProgram.id ? data : p)))
        } else {
          setPrograms((prev) => [data, ...prev])
        }

        setDialogOpen(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save program",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save program",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingProgramId) return

    try {
      const response = await fetch(`/api/admin/programs/${deletingProgramId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Program deleted",
          description: "The program has been deleted successfully",
        })
        setPrograms((prev) => prev.filter((p) => p.id !== deletingProgramId))
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete program",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingProgramId(null)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", image_url: "" })
    setEditingProgram(null)
  }

  const openEditDialog = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      slug: program.slug,
      description: program.description,
      image_url: program.image_url || "",
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10] hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-[#0B0C10] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#F3F7FA]">{editingProgram ? "Edit Program" : "Create Program"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#F3F7FA]">
                  Program Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug || name.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }}
                  className="border-white/20 bg-white/10 text-[#F3F7FA]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-[#F3F7FA]">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="border-white/20 bg-white/10 text-[#F3F7FA]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#F3F7FA]">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="border-white/20 bg-white/10 text-[#F3F7FA]"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-[#F3F7FA]">
                  Image URL (optional)
                </Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  className="border-white/20 bg-white/10 text-[#F3F7FA]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#12E8D5] to-[#8E2DE2] text-[#0B0C10]"
                >
                  {editingProgram ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 rounded-xl border-white/20 bg-white/5 text-[#F3F7FA]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-[#F3F7FA]">Program</TableHead>
              <TableHead className="text-[#F3F7FA]">Slug</TableHead>
              <TableHead className="text-[#F3F7FA]">Updated</TableHead>
              <TableHead className="text-right text-[#F3F7FA]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-[#F3F7FA]">{program.name}</TableCell>
                <TableCell className="font-mono text-sm text-[#F3F7FA]/70">{program.slug}</TableCell>
                <TableCell className="text-[#F3F7FA]/70">{formatDate(program.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(program)}
                      className="text-[#12E8D5] hover:bg-[#12E8D5]/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDeletingProgramId(program.id)
                        setDeleteDialogOpen(true)
                      }}
                      className="text-[#FF4B4B] hover:bg-[#FF4B4B]/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-white/10 bg-[#0B0C10]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#F3F7FA]">Delete Program</AlertDialogTitle>
            <AlertDialogDescription className="text-[#F3F7FA]/70">
              Are you sure you want to delete this program? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/5 text-[#F3F7FA] hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#FF4B4B] text-white hover:bg-[#FF4B4B]/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
