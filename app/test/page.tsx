'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [testData, setTestData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClientComponentClient()

  const addTestData = async () => {
    try {
      setLoading(true)
      setMessage('Ajout des données en cours...')
      
      const { data, error } = await supabase
        .from('Test')
        .insert([
          { test: ['Premier test'] },
          { test: ['Deuxième test'] }
        ])
        .select()

      if (error) {
        console.error('Erreur insertion:', error)
        setError(error)
        setMessage('Erreur lors de l\'ajout des données')
      } else {
        console.log('Données insérées:', data)
        setMessage('Données ajoutées avec succès!')
        await fetchData()
      }
    } catch (e) {
      console.error('Erreur catch:', e)
      setError(e)
      setMessage('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Test')
        .select('*')
      
      if (error) {
        console.error('Erreur fetch:', error)
        setError(error)
      } else {
        console.log('Données récupérées:', data)
        setTestData(data)
      }
    } catch (e) {
      console.error('Erreur catch fetch:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <button 
        onClick={addTestData}
        disabled={loading}
        className={`mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? 'En cours...' : 'Ajouter des données de test'}
      </button>

      {message && (
        <div className={`p-4 mb-4 rounded ${error ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}

      <div className="p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-4">Database Response:</h2>
        <pre className="whitespace-pre-wrap bg-card p-4 rounded-md">
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>
    </div>
  )
}