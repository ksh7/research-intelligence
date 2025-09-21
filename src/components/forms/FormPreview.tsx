import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface FormPreviewProps {
  surveyJson: any;
  onClose: () => void;
  onSubmit?: (result: any) => void;
  isPublicView?: boolean;
}

export function FormPreview({ surveyJson, onClose, onSubmit, isPublicView = false }: FormPreviewProps) {
  const { title, description, questions } = surveyJson;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result: any = {};
    
    questions.forEach((question: any) => {
      const value = formData.get(question.id);
      if (value) {
        result[question.id] = value;
      }
    });

    if (onSubmit) {
      onSubmit(result);
    } else {
      alert('Form submitted successfully! (This is a preview)');
    }
  };

  return (
    <div className={`${isPublicView ? '' : 'fixed inset-0 bg-white z-50'} overflow-auto`}>
      <div className="min-h-screen bg-gray-50">
        {!isPublicView && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Research Form Preview</h2>
              <Button variant="ghost" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </Button>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center border-b pb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="text-gray-600 mt-2">{description}</p>
                  )}
                </div>
                
                {questions.map((question: any, index: number) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      {index + 1}. {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {question.description && (
                      <p className="text-sm text-gray-600">{question.description}</p>
                    )}
                    
                    {question.type === 'text' && (
                      <input
                        type="text"
                        name={question.id}
                        required={question.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your answer"
                      />
                    )}
                    
                    {question.type === 'textarea' && (
                      <textarea
                        name={question.id}
                        required={question.required}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your answer"
                      />
                    )}
                    
                    {question.type === 'radio' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <label key={optIndex} className="flex items-center">
                            <input 
                              type="radio" 
                              name={question.id} 
                              value={option}
                              required={question.required}
                              className="mr-2" 
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'checkbox' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <label key={optIndex} className="flex items-center">
                            <input 
                              type="checkbox" 
                              name={`${question.id}[]`} 
                              value={option}
                              className="mr-2" 
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'select' && question.options && (
                      <select 
                        name={question.id}
                        required={question.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an option</option>
                        {question.options.map((option: string, optIndex: number) => (
                          <option key={optIndex} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {question.type === 'rating' && (
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="flex flex-col items-center">
                            <input 
                              type="radio" 
                              name={question.id} 
                              value={rating}
                              required={question.required}
                              className="mb-1" 
                            />
                            <span className="text-sm">{rating}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="pt-6 border-t">
                  <Button type="submit">Submit Survey</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}