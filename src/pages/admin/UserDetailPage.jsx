import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTenant } from '../../context/TenantContext'
import { profileService } from '../../services/profile.service'
import SectionCard from '../../components/ui/SectionCard'
import InfoField from '../../components/ui/InfoField'
import toast from 'react-hot-toast'

function UserDetailPage() {
  const { config } = useTenant()
  const { userId } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile]         = useState(null)
  const [documents, setDocuments]     = useState([])
  const [isLoading, setIsLoading]     = useState(true)
  const [isSaving, setIsSaving]       = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing]     = useState(false)

  const [formData, setFormData] = useState({})

  const [docForm, setDocForm] = useState({
    document_type: '', title: '', file: null, description: '',
  })

  useEffect(() => {
    fetchUserProfile()
    fetchUserDocuments()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const res = await profileService.getUserProfile(userId)
      setProfile(res.data)
      populateForm(res.data)
    } catch (err) {
      toast.error('Failed to load user profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserDocuments = async () => {
    try {
      const res = await profileService.getUserDocuments(userId)
      setDocuments(res.data)
    } catch (err) {
      console.error('Failed to load documents')
    }
  }

  const populateForm = (data) => {
    const bp = data?.base_profile
    const roleSpecific = {}

    // student fields
    if (data?.enrollment_number !== undefined) {
      roleSpecific.enrollment_number = data.enrollment_number || ''
      roleSpecific.department        = data.department        || ''
      roleSpecific.program           = data.program           || ''
      roleSpecific.semester          = data.semester          || ''
      roleSpecific.batch_year        = data.batch_year        || ''
      roleSpecific.cgpa              = data.cgpa              || ''
    }

    // faculty/admin fields
    if (data?.designation !== undefined) {
      roleSpecific.designation      = data.designation      || ''
      roleSpecific.office_number    = data.office_number    || ''
      roleSpecific.office_location  = data.office_location  || ''
    }

    // faculty only
    if (data?.qualification !== undefined) {
      roleSpecific.qualification    = data.qualification    || ''
      roleSpecific.specialization   = data.specialization   || ''
      roleSpecific.experience_years = data.experience_years || ''
    }

    setFormData({
      base_profile: {
        phone_number:      bp?.phone_number      || '',
        emergency_contact: bp?.emergency_contact || '',
        father_name:       bp?.father_name       || '',
        date_of_birth:     bp?.date_of_birth     || '',
        gender:            bp?.gender            || '',
        nationality:       bp?.nationality       || '',
        cnic:              bp?.cnic              || '',
        religion:          bp?.religion          || '',
        address:           bp?.address           || '',
        city:              bp?.city              || '',
        country:           bp?.country           || '',
        bio:               bp?.bio               || '',
      },
      ...roleSpecific,
    })
  }

  const handleBaseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      base_profile: { ...prev.base_profile, [field]: value }
    }))
  }

  const handleRoleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await profileService.updateUserProfile(userId, formData)
      setProfile(res.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDocUpload = async (e) => {
    e.preventDefault()
    if (!docForm.file || !docForm.document_type || !docForm.title) {
      toast.error('Please fill all document fields')
      return
    }
    setIsUploading(true)
    try {
      const data = new FormData()
      data.append('document_type', docForm.document_type)
      data.append('title', docForm.title)
      data.append('file', docForm.file)
      data.append('description', docForm.description)
      await profileService.uploadUserDocument(userId, data)
      toast.success('Document uploaded!')
      setDocForm({ document_type: '', title: '', file: null, description: '' })
      fetchUserDocuments()
    } catch (err) {
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const bp = profile?.base_profile
  const role = bp?.roles?.[0]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')}
            className="text-sm text-gray-400 hover:underline">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">
            {bp?.first_name} {bp?.last_name}
          </h1>
          <span style={{ backgroundColor: config?.color }}
            className="text-white px-2 py-0.5 rounded-full text-xs">{role}</span>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={{ backgroundColor: config?.color }}
            className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving}
              style={{ backgroundColor: config?.color }}
              className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <div className="flex items-center gap-4">
          {bp?.profile_picture ? (
            <img src={bp.profile_picture} alt=""
              className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div style={{ backgroundColor: config?.color }}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {bp?.first_name?.[0]}{bp?.last_name?.[0]}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-800">{bp?.first_name} {bp?.last_name}</p>
            <p className="text-sm text-gray-400">{bp?.email}</p>
          </div>
        </div>
      </SectionCard>

      {/* Role Specific Info — editable by admin */}
      {role === 'student' && (
        <SectionCard title="Academic Information">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Enrollment Number', field: 'enrollment_number' },
                { label: 'Department',        field: 'department' },
                { label: 'Program',           field: 'program' },
                { label: 'Semester',          field: 'semester', type: 'number' },
                { label: 'Batch Year',        field: 'batch_year', type: 'number' },
                { label: 'CGPA',              field: 'cgpa', type: 'number' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                  <input type={type || 'text'} value={formData[field] || ''}
                    onChange={(e) => handleRoleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Enrollment Number" value={profile?.enrollment_number} />
              <InfoField label="Department"         value={profile?.department} />
              <InfoField label="Program"            value={profile?.program} />
              <InfoField label="Semester"           value={profile?.semester} />
              <InfoField label="Batch Year"         value={profile?.batch_year} />
              <InfoField label="CGPA"               value={profile?.cgpa} />
            </div>
          )}
        </SectionCard>
      )}

      {role === 'faculty' && (
        <SectionCard title="Professional Information">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Designation',     field: 'designation' },
                { label: 'Qualification',   field: 'qualification' },
                { label: 'Specialization',  field: 'specialization' },
                { label: 'Experience Years', field: 'experience_years', type: 'number' },
                { label: 'Office Number',   field: 'office_number' },
                { label: 'Office Location', field: 'office_location' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                  <input type={type || 'text'} value={formData[field] || ''}
                    onChange={(e) => handleRoleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Designation"     value={profile?.designation} />
              <InfoField label="Qualification"   value={profile?.qualification} />
              <InfoField label="Specialization"  value={profile?.specialization} />
              <InfoField label="Experience"      value={profile?.experience_years ? `${profile.experience_years} years` : null} />
              <InfoField label="Office Number"   value={profile?.office_number} />
              <InfoField label="Office Location" value={profile?.office_location} />
            </div>
          )}
        </SectionCard>
      )}

      {role === 'admin' && (
        <SectionCard title="Admin Information">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Designation',     field: 'designation' },
                { label: 'Office Number',   field: 'office_number' },
                { label: 'Office Location', field: 'office_location' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                  <input type="text" value={formData[field] || ''}
                    onChange={(e) => handleRoleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Designation"     value={profile?.designation} />
              <InfoField label="Office Number"   value={profile?.office_number} />
              <InfoField label="Office Location" value={profile?.office_location} />
            </div>
          )}
        </SectionCard>
      )}

      {/* Personal Info */}
      <SectionCard title="Personal Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Father Name',   field: 'father_name' },
              { label: 'Date of Birth', field: 'date_of_birth', type: 'date' },
              { label: 'CNIC',          field: 'cnic' },
              { label: 'Religion',      field: 'religion' },
              { label: 'Nationality',   field: 'nationality' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                <input type={type || 'text'} value={formData.base_profile?.[field] || ''}
                  onChange={(e) => handleBaseChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Gender</label>
              <select value={formData.base_profile?.gender || ''}
                onChange={(e) => handleBaseChange('gender', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Father Name"   value={bp?.father_name} />
            <InfoField label="Date of Birth" value={bp?.date_of_birth} />
            <InfoField label="Gender"        value={bp?.gender} />
            <InfoField label="CNIC"          value={bp?.cnic} />
            <InfoField label="Religion"      value={bp?.religion} />
            <InfoField label="Nationality"   value={bp?.nationality} />
          </div>
        )}
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Phone Number',      field: 'phone_number' },
              { label: 'Emergency Contact', field: 'emergency_contact' },
              { label: 'City',              field: 'city' },
              { label: 'Country',           field: 'country' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                <input type="text" value={formData.base_profile?.[field] || ''}
                  onChange={(e) => handleBaseChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Address</label>
              <textarea value={formData.base_profile?.address || ''}
                onChange={(e) => handleBaseChange('address', e.target.value)}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Phone Number"      value={bp?.phone_number} />
            <InfoField label="Emergency Contact" value={bp?.emergency_contact} />
            <InfoField label="Address"           value={bp?.address} />
            <InfoField label="City"              value={bp?.city} />
            <InfoField label="Country"           value={bp?.country} />
          </div>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Documents">
        <form onSubmit={handleDocUpload} className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Document Type</label>
            <select value={docForm.document_type}
              onChange={(e) => setDocForm(prev => ({ ...prev, document_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">Select type</option>
              <option value="matric_result">Matric Result</option>
              <option value="fsc_result">FSC Result</option>
              <option value="bachelor_degree">Bachelor Degree</option>
              <option value="transcript">Transcript</option>
              <option value="admission_letter">Admission Letter</option>
              <option value="phd_degree">PhD Degree</option>
              <option value="master_degree">Master Degree</option>
              <option value="experience_letter">Experience Letter</option>
              <option value="appointment_letter">Appointment Letter</option>
              <option value="cnic">CNIC</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Title</label>
            <input type="text" value={docForm.title}
              onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Document title" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">File</label>
            <input type="file"
              onChange={(e) => setDocForm(prev => ({ ...prev, file: e.target.files[0] }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Description (optional)</label>
            <input type="text" value={docForm.description}
              onChange={(e) => setDocForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Optional description" />
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={isUploading} style={{ backgroundColor: config?.color }}
              className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>

        {documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{doc.title}</p>
                  <p className="text-xs text-gray-400">{doc.document_type}</p>
                </div>
                <a href={doc.file} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline">View</a>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

    </div>
  )
}

export default UserDetailPage