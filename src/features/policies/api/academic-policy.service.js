import client from '../../../shared/api/client';

const ACADEMIC_POLICY_URL = '/api/v1/academics/academic-policy/';

/**
 * Academic policy is a singleton resource. The API returns one object rather
 * than a collection, so callers should not expect an `items` array.
 */
export const getAcademicPolicy = async (config = {}) => {
  const response = await client.get(ACADEMIC_POLICY_URL, config);
  return response.data;
};

/** Replace the complete singleton record. */
export const putAcademicPolicy = async (policy, config = {}) => {
  const response = await client.put(ACADEMIC_POLICY_URL, policy, config);
  return response.data;
};

/** Update only the supplied policy fields. */
export const patchAcademicPolicy = async (policy, config = {}) => {
  const response = await client.patch(ACADEMIC_POLICY_URL, policy, config);
  return response.data;
};

export { ACADEMIC_POLICY_URL };

export default {
  getAcademicPolicy,
  putAcademicPolicy,
  patchAcademicPolicy,
};
