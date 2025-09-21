import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../lib/supabase';

export function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch form directly by ID for public access
        const { data: formData, error } = await supabase
          .from('research_forms')
          .select('*')
          .eq('id', formId)
          .eq('is_public', true)
          .eq('is_accepting_responses', true)
          .single();

        if (error) {
          console.error('Error fetching form:', error);
          throw new Error('Form not found or no longer accepting responses');
        }
        
        setForm(formData);
      } catch (err: any) {
        setError(err.message || 'Form not found or no longer accepting responses');
        console.error('Error loading public form:', err);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const submitResponse = async (formId: string, responseData: any, respondentIp?: string) => {
    const { error } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        response_data: responseData,
      });

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    try {
      setSubmitting(true);
      setError(null);

      // Check consent if required
      if (!consentGiven) {
        setError('Please provide consent to participate in this research.');
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);
      const responseData: any = {};
      
      // Process form data based on survey JSON structure
      if (form.survey_json?.questions) {
        form.survey_json.questions.forEach((question: any) => {
          if (question.type === 'checkbox') {
            // Handle multiple checkbox values
            const values = formData.getAll(`${question.id}[]`);
            if (values.length > 0) {
              responseData[question.title] = values;
            }
          } else {
            const value = formData.get(question.id);
            if (value) {
              responseData[question.title] = value;
            }
          }
        });
      }

      await submitResponse(form.id, responseData);
      setSubmitted(true);
    } catch (err: any) {
      setError('Failed to submit response. Please try again.');
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Available</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
            <p className="text-gray-600">The requested form could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { survey_json } = form;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Durkheim Intelligence</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {survey_json?.title || form.name}
                </h1>
                {survey_json?.description && (
                  <p className="text-gray-600 text-lg">
                    {survey_json.description}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Questions */}
              {survey_json?.questions?.map((question: any, index: number) => (
                <div key={question.id} className="space-y-3">
                  <label className="block text-lg font-medium text-gray-900">
                    {index + 1}. {question.title}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {question.description && (
                    <p className="text-gray-600">{question.description}</p>
                  )}
                  
                  {/* Text Input */}
                  {question.type === 'text' && (
                    <input
                      type="text"
                      name={question.id}
                      required={question.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your answer"
                    />
                  )}
                  
                  {/* Textarea */}
                  {question.type === 'textarea' && (
                    <textarea
                      name={question.id}
                      required={question.required}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your answer"
                    />
                  )}
                  
                  {/* Radio Buttons */}
                  {question.type === 'radio' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option: string, optIndex: number) => (
                        <label key={optIndex} className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name={question.id} 
                            value={option}
                            required={question.required}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {/* Checkboxes */}
                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option: string, optIndex: number) => (
                        <label key={optIndex} className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name={`${question.id}[]`} 
                            value={option}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {/* Select Dropdown */}
                  {question.type === 'select' && question.options && (
                    <select 
                      name={question.id}
                      required={question.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select an option</option>
                      {question.options.map((option: string, optIndex: number) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {/* Rating Scale */}
                  {question.type === 'rating' && (
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating} className="flex flex-col items-center space-y-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={question.id} 
                            value={rating}
                            required={question.required}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                          />
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}


              {/* Consent Checkbox */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      Yes, I consent to providing details for this research
                    </span>
                    <p className="text-gray-600 mt-1">
                      By checking this box, you agree to participate in this research study and understand that your responses will be used for research purposes.
                    </p>
                  </div>
                </label>
              </div>
              
              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button 
                  type="submit" 
                  loading={submitting}
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}