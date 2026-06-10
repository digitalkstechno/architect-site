import { useState, useEffect } from "react";
import { Plus, FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { documentService, Document } from "@/services/document.service";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export function DocumentsTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    documentType: "CAD",
  });
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const data = await documentService.getDocumentsByProject(projectId);
      setDocuments(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("project", projectId);
      uploadData.append("title", formData.title);
      uploadData.append("documentType", formData.documentType);
      uploadData.append("file", file);

      await documentService.createDocument(uploadData);
      toast.success("Document added");
      setIsModalOpen(false);
      setFormData({ title: "", documentType: "CAD" });
      setFile(null);
      fetchDocs();
    } catch (error) {
      toast.error("Failed to add document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      toast.success("Deleted");
      fetchDocs();
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Document
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <div key={doc._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h4 className="font-bold text-sm text-slate-800">{doc.title}</h4>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{doc.documentType}</span>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full gap-2 text-xs">
                  View
                </Button>
              </a>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${doc._id}/download`} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full gap-2 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </a>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(doc._id)} className="px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        {documents.length === 0 && <div className="col-span-full text-center p-8 text-slate-500 text-sm">No documents found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold">Title</label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
          <div><label className="text-xs font-bold">Type</label><Select value={formData.documentType} onChange={v => setFormData({...formData, documentType: v})} options={[
            {value: "CAD", label: "CAD Drawing"},
            {value: "PDF", label: "PDF Document"},
            {value: "Render", label: "3D Render"},
            {value: "Image", label: "Image"},
            {value: "Other", label: "Other"},
          ]} /></div>
          <div><label className="text-xs font-bold">Upload File</label>
            <input type="file" className="w-full text-sm mt-1 p-2 border rounded" onChange={e => setFile(e.target.files?.[0] || null)} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}
