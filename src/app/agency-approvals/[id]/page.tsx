"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { agencyService, AgencyRegistration } from "@/services/agency.service";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ShieldCheck, XCircle, Briefcase, Mail, Phone, MapPin, Instagram, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function AgencyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [agency, setAgency] = useState<AgencyRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAgencyDetails();
    }
  }, [id]);

  const fetchAgencyDetails = async () => {
    try {
      setIsLoading(true);
      const data = await agencyService.getRegistrationById(id);
      setAgency(data);
    } catch (error) {
      console.error("Error fetching agency details:", error);
      toast.error("Failed to load agency details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await agencyService.approveRegistration(id);
      toast.success("Agency approved and added to Staff!");
      router.push("/agency-approvals");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve agency");
    }
  };

  const handleReject = async () => {
    try {
      await agencyService.rejectRegistration(id);
      toast.success("Agency registration rejected");
      router.push("/agency-approvals");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject agency");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="p-8 text-center text-slate-500">
        Registration details not found.
        <br/>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agency Details</h1>
            <p className="text-xs font-medium text-slate-500">Review registration application</p>
          </div>
        </div>
        
        {agency.status === "Pending" ? (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReject} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-200">
              <ShieldCheck className="w-4 h-4" /> Approve
            </Button>
          </div>
        ) : (
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${agency.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {agency.status === "Approved" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {agency.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            {agency.profilePhoto ? (
              <img src={agency.profilePhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-24 h-24 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-indigo-100">
                <span className="text-3xl font-bold text-indigo-600">{agency.agencyName[0].toUpperCase()}</span>
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-900 mb-1">{agency.agencyName}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-100">
              <Briefcase className="w-3 h-3" /> {typeof agency.businessType === "string" ? agency.businessType : agency.businessType?.name || "Unknown"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-slate-600">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-900">{agency.mobile}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-600">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-900">{agency.email}</span>
              </div>
              {agency.officeAddress && (
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                  <span className="font-medium text-slate-900">{agency.officeAddress}</span>
                </div>
              )}
              {agency.instagramLink && (
                <div className="flex items-start gap-3 text-slate-600">
                  <Instagram className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                  <a href={agency.instagramLink} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">Instagram Profile</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Business Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">Business Details</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                <p className="text-sm font-bold text-slate-900">{agency.experience || 0} Years</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed Projects</p>
                <p className="text-sm font-bold text-slate-900">{agency.completedProjectsCount || 0}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Working Cities</p>
                <div className="flex gap-2 flex-wrap mt-1">
                  {agency.workingCities?.map((city, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">{city}</span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Services Offered</p>
                <div className="flex gap-2 flex-wrap mt-1">
                  {agency.servicesOffered?.map((service, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100">{service}</span>
                  ))}
                </div>
              </div>
            </div>

            {agency.aboutUs && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">About Us</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{agency.aboutUs}</p>
              </div>
            )}
            
            {agency.clientReviews && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client Reviews & Links</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{agency.clientReviews}</p>
              </div>
            )}
          </div>

          {/* Project Photos */}
          {agency.projectPhotos && agency.projectPhotos.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">Project Portfolio ({agency.projectPhotos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {agency.projectPhotos.map((photo, idx) => (
                  <a key={idx} href={photo} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={photo} alt={`Project ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
