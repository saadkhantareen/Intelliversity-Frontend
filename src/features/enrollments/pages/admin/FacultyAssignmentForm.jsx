import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FacultyAssignmentFormFields from '../../components/FacultyAssignmentFormFields';
import { useFacultyAssignment } from '../../hooks/useFacultyAssignment';
import { useEnrollmentRelationLookups } from '../../hooks/useEnrollmentRelationLookups';
import { validateFacultyAssignment } from '../../utils/enrollmentRelations.utils';

const FacultyAssignmentForm = () => {
  const { id: facultyAssignmentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(facultyAssignmentId);
  const { values, setValues, isLoading, isSaving, error, saveFacultyAssignment } =
    useFacultyAssignment(facultyAssignmentId);
  const {
    courseOfferings,
    profiles: faculties,
    isLoading: isLoadingLookups,
    error: lookupsError,
  } = useEnrollmentRelationLookups('faculty');
  const [validationError, setValidationError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateFacultyAssignment(values);
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    try {
      await saveFacultyAssignment(values);
      toast.success(`Faculty assignment ${isEditMode ? 'updated' : 'created'} successfully.`);
      navigate('/enrollments/faculty-assignments');
    } catch {
      // The hook supplies a user-facing request error.
    }
  };

  if (isLoading || isLoadingLookups) {
    return (
      <section className="mx-auto w-full max-w-[860px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div
          className="grid min-h-[180px] place-content-center px-8 py-8 text-sm text-slate-500"
          role="status"
        >
          Loading faculty assignment details…
        </div>
      </section>
    );
  }

  const formError = validationError || error || lookupsError;
  const hasRequiredLookupOptions = courseOfferings.length && faculties.length;
  const isFormDisabled = isSaving || !hasRequiredLookupOptions;

  return (
    <section
      className="mx-auto w-full max-w-[860px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="faculty-assignment-form-title"
    >
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Academic setup
        </p>
        <h1
          id="faculty-assignment-form-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {isEditMode ? 'Edit faculty assignment' : 'Add faculty assignment'}
        </h1>
        <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate-500">
          {isEditMode
            ? 'Update the assigned course offering, faculty member, or approval status.'
            : 'Assign a faculty member to a course offering and set the initial approval status.'}
        </p>
      </header>

      <form
        className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && (
          <p
            className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
            role="alert"
          >
            {formError}
          </p>
        )}

        {!hasRequiredLookupOptions && !lookupsError && (
          <p
            className="mb-5 border-l-[3px] border-amber-600 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-900"
            role="alert"
          >
            At least one course offering and one faculty profile must be available before an
            assignment can be created.
          </p>
        )}

        <FacultyAssignmentFormFields
          values={values}
          courseOfferings={courseOfferings}
          faculties={faculties}
          onChange={handleChange}
          disabled={isFormDisabled}
        />

        <footer className="mt-8 flex flex-col-reverse gap-2.5 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 motion-reduce:transition-none"
            to="/enrollments/faculty-assignments"
          >
            Cancel
          </Link>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            type="submit"
            disabled={isFormDisabled}
          >
            {isSaving ? 'Saving…' : isEditMode ? 'Save changes' : 'Create faculty assignment'}
          </button>
        </footer>
      </form>
    </section>
  );
};

export default FacultyAssignmentForm;
