import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ProfileService from "@/services/profile.service";
import api from "@/services/api";

const EMPTY_FORM = {
  // Account
  email: "", password: "", first_name: "", last_name: "",
  // Faculty-specific
  registration_id: "", designation: "", qualification: "",
  specialization: "", experience_years: "", office_number: "",
  office_location: "", department: "",
  // Personal
  father_name: "", date_of_birth: "", gender: "",
  nationality: "", cnic: "", religion: "",
  // Contact
  phone_number: "", emergency_contact: "",
  // Address
  address: "", city: "", country: "", bio: "",
};

export default function FacultyForm({ onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    api
      .get("/api/v1/academics/departments/")
      .then((res) => setDepartments(res.data?.results ?? res.data ?? []))
      .catch(() => {
        setDepartments([]);
        toast.error("Failed to load departments. Please refresh.");
      });
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  function flattenErrors(data) {
    const flat = {};
    if (data.registration_id) flat.registration_id = data.registration_id[0];
    if (data.designation) flat.designation = data.designation[0];
    if (data.qualification) flat.qualification = data.qualification[0];
    if (data.specialization) flat.specialization = data.specialization[0];
    if (data.experience_years) flat.experience_years = data.experience_years[0];
    if (data.office_number) flat.office_number = data.office_number[0];
    if (data.office_location) flat.office_location = data.office_location[0];
    if (data.department) flat.department = data.department[0];
    if (data.non_field_errors) flat.non_field = data.non_field_errors[0];
    if (data.detail) flat.non_field = data.detail;

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

    const u = bp.user ?? {};
    if (u.email) flat.email = u.email[0];
    if (u.password) flat.password = u.password[0];
    if (u.first_name) flat.first_name = u.first_name[0];
    if (u.last_name) flat.last_name = u.last_name[0];

    return flat;
  }

  function firstError(flat) {
    return Object.values(flat).find(Boolean) ?? "Please fix the errors and try again.";
  }

  function buildPayload() {
    return {
      registration_id: form.registration_id.trim(),
      designation: form.designation.trim() || null,
      qualification: form.qualification.trim() || null,
      specialization: form.specialization.trim() || null,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      office_number: form.office_number.trim() || null,
      office_location: form.office_location.trim() || null,
      department: form.department || null,
      base_profile: {
        user: {
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          password: form.password,
          role: "faculty",
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

    const toastId = toast.loading("Registering faculty member…");

    try {
      const data = await ProfileService.createFaculty(buildPayload());

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
      toast.error(firstError(flat), { id: toastId, duration: 5000 });
    } finally {
      setLoading(false);
    }
  }

  // ── Field helpers ──────────────────────────────────────────────────────
  const inp = (id, label, type = "text", placeholder = "", required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[id] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      />
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  const sel = (id, label, options, required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={form[id]}
        onChange={set(id)}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[id] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      >
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
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

      {/* ── Account ── */}
      {heading("Account")}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp("email", "University email", "email", "dr.ali@fast.edu.pk", true)}
        {inp("password", "Password", "password", "Min 8 chars, 1 upper, 1 number, 1 symbol", true)}
        {inp("first_name", "First name", "text", "Ali", true)}
        {inp("last_name", "Last name", "text", "Hassan", true)}
      </div>

      {/* ── Faculty details ── */}
      {heading("Faculty details")}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp("registration_id", "Registration ID", "text", "FAC-001", true)}

        {/* Department — populated from API */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Department</label>
          <select
            value={form.department}
            onChange={set("department")}
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.department ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">— select department —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name ?? d.id}</option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
        </div>

        {inp("designation", "Designation", "text", "Assistant Professor")}
        {inp("qualification", "Qualification", "text", "PhD Computer Science")}
        {inp("specialization", "Specialization", "text", "Machine Learning")}
        {inp("experience_years", "Experience (years)", "number", "5")}
        {inp("office_number", "Office number", "text", "301")}
        {inp("office_location", "Office location", "text", "Block A")}
      </div>

      {/* ── Personal ── */}
      {heading("Personal details")}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {inp("father_name", "Father's name", "text", "Hassan")}
        {inp("date_of_birth", "Date of birth", "date")}
        {sel("gender", "Gender", [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ])}
        {inp("nationality", "Nationality", "text", "Pakistani")}
        {inp("cnic", "CNIC", "text", "35404-1343427-3")}
        {inp("religion", "Religion", "text", "Islam")}
      </div>

      {/* ── Contact ── */}
      {heading("Contact")}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp("phone_number", "Phone number", "text", "0321-1234567")}
        {inp("emergency_contact", "Emergency contact", "text", "0300-0000000")}
      </div>

      {/* ── Address ── */}
      {heading("Address")}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {inp("address", "Address", "text", "Street / Block")}
        {inp("city", "City", "text", "Islamabad")}
        {inp("country", "Country", "text", "Pakistan")}
      </div>

      {/* ── Bio ── */}
      {heading("Bio")}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={form.bio}
          onChange={set("bio")}
          placeholder="A brief note about the faculty member…"
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
            className="px-5 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Registering…" : "Register faculty"}
        </button>
      </div>

    </form>
  );
}