"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CheckCircle2, UploadCloud, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { agencyService } from "@/services/agency.service";

export default function AgencyRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    agencyName: "",
    mobile: "",
    email: "",
    businessType: "",
    officeAddress: "",
    experience: "",
    servicesOffered: "",
    workingCities: "",
    aboutUs: "",
    completedProjectsCount: "",
    instagramLink: "",
    clientReviews: ""
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<File[]>([]);
  const [businessTypes, setBusinessTypes] = useState<{_id: string, name: string}[]>([]);
  
  // Real Email OTP State
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await agencyService.getRoles();
        setBusinessTypes(roles);
      } catch (error) {
        console.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const projectPhotosRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleProjectPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (projectPhotos.length + newFiles.length > 10) {
        toast.error("You can upload a maximum of 10 project photos.");
        return;
      }
      setProjectPhotos([...projectPhotos, ...newFiles]);
    }
  };

  const removeProjectPhoto = (index: number) => {
    setProjectPhotos(projectPhotos.filter((_, i) => i !== index));
  };

  const sendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setIsVerifying(true);
      await agencyService.sendOtp(formData.email);
      setOtpSent(true);
      toast.success(`OTP sent to ${formData.email}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }
    try {
      setIsVerifying(true);
      await agencyService.verifyOtp(formData.email, otpCode);
      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agencyName) return toast.error("Please enter Agency / Owner Name.");
    if (!formData.mobile) return toast.error("Please enter Mobile Number.");
    if (formData.mobile.length !== 10) return toast.error("Please enter exactly 10 digits for the Mobile Number.");
    if (!formData.email) return toast.error("Please enter Email Address.");
    if (!emailVerified) return toast.error("Please verify your Email Address.");
    if (!formData.businessType) return toast.error("Please select a Business Type.");
    if (!formData.officeAddress) return toast.error("Please enter Office Address.");
    if (!formData.experience) return toast.error("Please enter Experience.");
    if (!formData.workingCities) return toast.error("Please enter Working Cities.");
    if (!formData.servicesOffered) return toast.error("Please enter Services Offered.");

    setIsLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (profilePhoto) {
        data.append("profilePhoto", profilePhoto);
      }

      projectPhotos.forEach((photo) => {
        data.append("projectPhotos", photo);
      });

      await agencyService.submitRegistration(data);

      setIsSuccess(true);
      toast.success("Registration submitted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-slate-500 mb-8">
            Thank you for registering. Your details have been sent to the administration. We will contact you once your profile is approved.
          </p>
          <Button onClick={() => router.push("/")} className="w-full font-bold">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agency Partner Registration</h1>
          <p className="text-slate-500 font-medium">Join our network of elite construction professionals.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">1. Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Agency / Owner Name *</label>
                  <Input name="agencyName" value={formData.agencyName} onChange={handleInputChange} placeholder="Enter full name or agency name" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Mobile Number (10 Digits) *</label>
                  <Input 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, mobile: val });
                    }} 
                    placeholder="9876543210" 
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    Email Address *
                    {emailVerified && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>}
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" disabled={emailVerified || otpSent} />
                      {!emailVerified && !otpSent && <Button type="button" onClick={sendOTP} disabled={isVerifying} variant="outline" className="shrink-0">{isVerifying ? "Sending..." : "Send OTP"}</Button>}
                    </div>
                    {otpSent && !emailVerified && (
                      <div className="flex gap-2 items-center mt-1 animate-in fade-in slide-in-from-top-2">
                        <Input 
                          placeholder="Enter 6-digit OTP" 
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value)} 
                          className="w-40 text-center tracking-widest font-mono" 
                          maxLength={6} 
                        />
                        <Button type="button" onClick={verifyOTP} disabled={isVerifying} className="bg-indigo-600 hover:bg-indigo-700">
                          {isVerifying ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Select
                    label="Business Type / Category *"
                    options={businessTypes.map(b => ({ value: b._id, label: b.name }))}
                    value={formData.businessType}
                    onChange={(val) => setFormData({ ...formData, businessType: val })}
                    placeholder="Select your primary service"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Business Details */}
            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">2. Business Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Office Address *</label>
                  <textarea 
                    name="officeAddress" 
                    value={formData.officeAddress} 
                    onChange={handleInputChange} 
                    className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    rows={3}
                    placeholder="Enter complete office address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Experience (Years) *</label>
                  <Input name="experience" type="number" value={formData.experience} onChange={handleInputChange} min="0" placeholder="e.g., 5" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Working Cities *</label>
                  <Input name="workingCities" value={formData.workingCities} onChange={handleInputChange} placeholder="e.g., Ahmedabad, Surat (comma separated)" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Services Offered *</label>
                  <Input name="servicesOffered" value={formData.servicesOffered} onChange={handleInputChange} placeholder="e.g., Core Cutting, Full Wiring, Custom Furniture" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">About Us</label>
                  <textarea 
                    name="aboutUs" 
                    value={formData.aboutUs} 
                    onChange={handleInputChange} 
                    className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    rows={4}
                    placeholder="Tell us about your company, team size, and specialties..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Media & Portfolio */}
            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">3. Media & Portfolio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Profile Photo / Logo *</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                    <input type="file" onChange={handleProfilePhotoChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <UploadCloud className="w-8 h-8 mb-2 text-indigo-400" />
                    <span className="text-xs font-medium text-center">{profilePhoto ? profilePhoto.name : "Click to upload logo"}</span>
                  </div>
                  {profilePhoto && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={URL.createObjectURL(profilePhoto)} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setProfilePhoto(null)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    Project Photos
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                    <input type="file" onChange={handleProjectPhotosChange} accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <UploadCloud className="w-8 h-8 mb-2 text-indigo-400" />
                    <span className="text-xs font-medium text-center">Click to upload photos ({projectPhotos.length}/10)</span>
                  </div>
                  {projectPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {projectPhotos.map((photo, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={URL.createObjectURL(photo)} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeProjectPhoto(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Completed Projects Count</label>
                  <Input name="completedProjectsCount" type="number" value={formData.completedProjectsCount} onChange={handleInputChange} min="0" placeholder="e.g., 50" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Instagram Link</label>
                  <Input name="instagramLink" type="url" value={formData.instagramLink} onChange={handleInputChange} placeholder="https://instagram.com/youragency" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Client Reviews & Ratings (Links/Details)</label>
                  <Input name="clientReviews" value={formData.clientReviews} onChange={handleInputChange} placeholder="Google Maps link, JustDial link, or average rating..." />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? "Submitting Registration..." : (
                  <>Submit Registration <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Already have an agency account?{" "}
                  <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                    Login here &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
