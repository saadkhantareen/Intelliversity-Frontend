import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ProfileService } from '../api/profile.service';
import api from '@/shared/api/client';
import { useCloudinary } from '@/features/media';

const EMPTY_FORM = {
  // Account
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  // Profile Picture
  profile_picture_public_id: '',
  profile_picture_url: '',
  // Student-specific
  registration_id: '',
  batch: '',
  cgpa: '',
  // Personal
  father_name: '',
  date_of_birth: '',
  gender: '',
  nationality: '',
  cnic: '',
  religion: '',
  // Contact
  phone_number: '',
  emergency_contact: '',
  // Address
  address: '',
  city: '',
  country: '',
  bio: '',
};

export default function StudentForm({ onSuccess, onCancel }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  const { uploadToCloudinary, isUploading } = useCloudinary();

  useEffect(() => {
    api
      .get('/api/v1/academics/batches/')
      .then((res) => setBatches(res.data?.results ?? res.data ?? []))
      .catch(() => {
        setBatches([]);
        toast.error('Failed to load batches. Please refresh.');
      });
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image (JPG, PNG).');
      e.target.value = null;
      return;
    }

    try {
      const { public_id, secure_url } = await uploadToCloudinary(file, 'profile');

      setForm((prev) => ({
        ...prev,
        profile_picture_public_id: public_id,
        profile_picture_url: secure_url,
      }));

      toast.success('Profile picture uploaded!');
    } catch (error) {
      console.error('Upload Error:', error);
    } finally {
      e.target.value = null;
    }
  };

  function flattenErrors(data) {
    const flat = {};

    if (typeof data === 'string') {
      flat.non_field = 'A server error occurred. Please check batch selection.';
      return flat;
    }

    if (data.registration_id)
      flat.registration_id = Array.isArray(data.registration_id)
        ? data.registration_id[0]
        : data.registration_id;
    if (data.batch) flat.batch = Array.isArray(data.batch) ? data.batch[0] : data.batch;
    if (data.cgpa) flat.cgpa = Array.isArray(data.cgpa) ? data.cgpa[0] : data.cgpa;
    if (data.non_field_errors)
      flat.non_field = Array.isArray(data.non_field_errors)
        ? data.non_field_errors[0]
        : data.non_field_errors;
    if (data.detail)
      flat.non_field = typeof data.detail === 'string' ? data.detail : 'Invalid request.';

    const bp = data.base_profile ?? {};
    if (bp.father_name) flat.father_name = bp.father_name[0];
    if (bp.date_of_birth) flat.date_of_birth = bp.date_of_birth[0];
    if (bp.gender) flat.gender = bp.gender[0];
    if (bp.nationality) flat.nationality = bp.nationality[0];
    if (bp.cnic) flat.cnic = bp.cnic[0];
    if (bp.religion) flat.religion = bp.religion[0];
    if (bp.phone_number) flat.phone_number = bp.phone_number[0];
    if (bp.emergency_contact) flat.emergency_contact = bp.emergency_contact[0];
    if (bp.address) flat.address = bp.address[0];
    if (bp.city) flat.city = bp.city[0];
    if (bp.country) flat.country = bp.country[0];
    if (bp.bio) flat.bio = bp.bio[0];

    if (bp.profile_picture_public_id)
      flat.profile_picture_public_id = bp.profile_picture_public_id[0];

    const u = bp.user ?? {};
    if (u.email) flat.email = u.email[0];
    if (u.password) flat.password = u.password[0];
    if (u.first_name) flat.first_name = u.first_name[0];
    if (u.last_name) flat.last_name = u.last_name[0];

    return flat;
  }

  function firstError(flat) {
    return (
      flat.non_field ||
      Object.values(flat).find((msg) => typeof msg === 'string') ||
      'Please fix the errors and try again.'
    );
  }

  function buildPayload() {
    return {
      registration_id: form.registration_id.trim(),
      batch: form.batch,
      cgpa: form.cgpa || null,
      base_profile: {
        profile_picture_public_id: form.profile_picture_public_id || null,
        user: {
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          password: form.password,
          role: 'student',
        },
        father_name: form.father_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        nationality: form.nationality.trim() || null,
        cnic: form.cnic.trim() || null,
        religion: form.religion.trim() || null,
        phone_number: form.phone_number.trim() || null,
        emergency_contact: form.emergency_contact.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        bio: form.bio.trim() || null,
      },
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const toastId = toast.loading('Registering student…');

    try {
      const data = await ProfileService.createStudent(buildPayload());

      toast.success(
        `${form.first_name} ${form.last_name} (${form.registration_id}) registered successfully!`,
        { id: toastId, duration: 4000 }
      );

      setForm(EMPTY_FORM);
      setErrors({});
      onSuccess?.(data);
    } catch (err) {
      const errData = err.response?.data ?? {};
      const flat = flattenErrors(errData);
      setErrors(flat);

      toast.error(firstError(flat), { id: toastId, duration: 4000 });
    } finally {
      setLoading(false);
    }
  }

  const inp = (id, label, type = 'text', placeholder = '', required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[id] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  const sel = (id, label, options, required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={form[id]}
        onChange={set(id)}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[id] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      >
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  const heading = (title) => (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b pb-1 mt-6 mb-3">
      {title}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-3xl">
      {/* ── Header Area: Account + Profile Picture ── */}
      <div className="flex justify-between items-end border-b pb-1 mt-6 mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 m-0">Account</p>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {form.profile_picture_url ? (
              <img
                src={form.profile_picture_url}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>

          <div className="flex flex-col items-start gap-1">
            <label
              htmlFor="profile-upload"
              className={`cursor-pointer text-sm font-medium px-3 py-1.5 rounded-md border transition-colors ${
                isUploading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </label>
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            {errors.profile_picture_public_id && (
              <p className="text-xs text-red-500 m-0">{errors.profile_picture_public_id}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp('email', 'University email', 'email', 'zaid@fast.edu.pk', true)}
        {inp('password', 'Password', 'password', 'Min 8 chars, 1 upper, 1 number, 1 symbol', true)}
        {inp('first_name', 'First name', 'text', 'Zaid', true)}
        {inp('last_name', 'Last name', 'text', 'Amjad', true)}
      </div>

      {/* ── Enrollment ── */}
      {heading('Enrollment')}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {inp('registration_id', 'Registration ID', 'text', 'FA26-BSE-001', true)}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Batch<span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={form.batch}
            onChange={set('batch')}
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.batch ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">— select batch —</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name ?? b.title ?? b.id}
              </option>
            ))}
          </select>
          {errors.batch && <p className="text-xs text-red-500">{errors.batch}</p>}
        </div>

        {inp('cgpa', 'CGPA', 'number', '0.00 – 4.00')}
      </div>

      {/* ── Personal ── */}
      {heading('Personal details')}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {inp('father_name', "Father's name", 'text', 'Amjad')}
        {inp('date_of_birth', 'Date of birth', 'date')}
        {sel('gender', 'Gender', [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ])}
        {inp('nationality', 'Nationality', 'text', 'Pakistani')}
        {inp('cnic', 'CNIC', 'text', '35404-1343427-3')}
        {inp('religion', 'Religion', 'text', 'Islam')}
      </div>

      {/* ── Contact ── */}
      {heading('Contact')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp('phone_number', 'Phone number', 'text', '0310-0044108')}
        {inp('emergency_contact', 'Emergency contact', 'text', '0300-0000000')}
      </div>

      {/* ── Address ── */}
      {heading('Address')}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {inp('address', 'Address', 'text', 'Street / Block')}
        {inp('city', 'City', 'text', 'Sheikhupura')}
        {inp('country', 'Country', 'text', 'Pakistan')}
      </div>

      {/* ── Bio ── */}
      {heading('Bio')}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={form.bio}
          onChange={set('bio')}
          placeholder="A brief note about the student…"
          rows={3}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isUploading}
            className="px-5 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || isUploading}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Registering…' : 'Register student'}
        </button>
      </div>
    </form>
  );
}
