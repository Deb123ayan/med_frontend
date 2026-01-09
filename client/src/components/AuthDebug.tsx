import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const AuthDebug = () => {
  const { doctor, token } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const testAuth = async () => {
      console.log('Testing API without authentication...');

      try {
        const response = await fetch('/api/patients/', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response status:', response.status);
        console.log('API Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          setTestResult(`✅ API call successful. Got ${data.length || 0} patients`);
        } else {
          const errorText = await response.text();
          setTestResult(`❌ API call failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        setTestResult(`❌ Network error: ${error}`);
      }
    };

    testAuth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold text-sm mb-2">API Debug (No Auth)</h3>
      <div className="text-xs space-y-1">
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          {testResult || 'Testing...'}
        </div>
      </div>
    </div>
  );
};