import { createContext, useContext, useState, useEffect } from 'react'
import { profileService } from '../services/profile.service'
import { useAuth } from './AuthContext'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth()

  const [profile, setProfile]     = useState(null)
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      fetchProfile()
      fetchDocuments()
    }
    if (!isAuthenticated) {
      setProfile(null)
      setDocuments([])
    }
  }, [isAuthenticated, isCheckingAuth])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const res = await profileService.getMyProfile()
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await profileService.getMyDocuments()
      setDocuments(res.data)
    } catch (err) {
      console.error('Failed to load documents')
    }
  }

  const updateProfile = async (data) => {
    const res = await profileService.updateMyProfile(data)
    setProfile(res.data)
    return res.data
  }

  const updateProfilePicture = async (file) => {
    const data = new FormData()
    data.append('profile_picture', file)
    const res = await profileService.updateMyProfile(data)
    setProfile(res.data)
    return res.data
  }

  const uploadDocument = async (data) => {
    const res = await profileService.uploadDocument(data)
    await fetchDocuments()
    return res.data
  }

  const deleteDocument = async (docId) => {
    await profileService.deleteDocument(docId)
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return (
    <ProfileContext.Provider value={{
      profile,
      documents,
      isLoading,
      fetchProfile,
      fetchDocuments,
      updateProfile,
      updateProfilePicture,
      uploadDocument,
      deleteDocument,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>')
  return ctx
}