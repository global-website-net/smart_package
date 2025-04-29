import { UserRole } from '@prisma/client'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Database operations using Supabase
export const db = {
  // Check if a user exists by email
  async userExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking user existence:', error)
      throw error
    }
    
    return !!data
  },

  // Create a new user
  async createUser(userData: {
    email: string
    password: string
    fullName: string
    governorate: string
    town: string
    phonePrefix: string
    phoneNumber: string
    role: UserRole
  }) {
    const id = uuidv4()
    
    const { data, error } = await supabase
      .from('User')
      .insert({
        id,
        email: userData.email,
        password: userData.password,
        fullname: userData.fullName,
        role: userData.role,
        governorate: userData.governorate,
        town: userData.town,
        phoneprefix: userData.phonePrefix,
        phonenumber: userData.phoneNumber
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return data
  },

  // Delete a user by ID
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Test database connection
  async testConnection() {
    const { data, error } = await supabase
      .from('User')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Error testing connection:', error)
      throw error
    }

    return { test: 1 }
  }
} 