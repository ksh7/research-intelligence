import React, { useState } from 'react';
import { X, Save, Eye, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useFormStore } from '../../stores/formStore';

interface FormBuilderProps {
  projectId: string;
  form?: any;
  onClose: () => void;
}

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export function FormBuilder({ projectId, form, onClose }: FormBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState(form?.name || '');
  const [formDescription, setFormDescription] = useState(form?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    form?.survey_json?.questions || [
      {
        id: '1',
        type: 'text',
        title: 'Sample Question',
        description: 'This is a sample question. You can edit or delete it.',
        required: false
      }
    ]
  );
  const [showPreview, setShowPreview] = useState(false);
  const { createForm, updateForm } = useFormStore();

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: `New ${type} question`,
      required: false,
      ...(type === 'radio' || type === 'checkbox' || type === 'select' ? { options: ['Option 1', 'Option 2'] } : {})
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleSave = async (saveAsDraft = false) => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      setLoading(true);
      
      const surveyJson = {
        title: formName,
        description: formDescription,
        questions: questions,
        showProgressBar: true,
        completedHtml: '<h3>Thank you for your participation!</h3><p>Your response has been recorded.</p>'
      };

      const formData = {
        name: formName,
        description: formDescription,
        project_id: projectId,
        survey_json: surveyJson,
        is_public: !saveAsDraft,
        is_accepting_responses: !saveAsDraft,
        consent_required: false,
      };

      let savedForm;
      if (form) {
        await updateForm(form.id, formData);
        savedForm = form;
      } else {
        savedForm = await createForm(formData);
      }
      
      // Generate public link if publishing
      if (!saveAsDraft && savedForm) {
        const { ensurePublicLink } = useFormStore.getState();
        await ensurePublicLink(savedForm.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionEditor = (question: Question) => (
    <Card key={question.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {question.type.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">Question {questions.indexOf(question) + 1}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteQuestion(question.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={question.description || ''}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional context or instructions"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Required question</label>
          </div>

          {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(question.id, index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    {question.options && question.options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  className="text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-900">{formName}</h1>
        {formDescription && (
          <p className="text-gray-600 mt-2">{formDescription}</p>
        )}
      </div>
      
      {questions.map((question, index) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Your answer"
              disabled
            />
          )}
          
          {question.type === 'textarea' && (
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Your answer"
              disabled
            />
          )}
          
          {question.type === 'radio' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center">
                  <input type="radio" name={question.id} className="mr-2" disabled />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.type === 'checkbox' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.type === 'select' && question.options && (
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
              <option>Select an option</option>
              {question.options.map((option, optIndex) => (
                <option key={optIndex}>{option}</option>
              ))}
            </select>
          )}
          
          {question.type === 'rating' && (
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} className="w-8 h-8 border border-gray-300 rounded text-sm" disabled>
                  {rating}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <div className="pt-6 border-t">
        <Button disabled>Submit Survey</Button>
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </Button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto p-6">
            <Card>
              <CardContent className="p-8">
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="min-h-screen bg-gray-50">
        {/* Main Container - 70% width centered */}
        <div className="max-w-none mx-auto" style={{ width: '70%' }}>
          <div className="py-8 space-y-6">
            
            {/* Top Action Buttons */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {form ? 'Edit Form' : 'Create New Form'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Build your research survey with custom questions
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleSave(true)}
                  loading={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleSave(false)}
                  loading={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Publish Form
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            {/* Form Name */}
            <div>
              <label htmlFor="formName" className="block text-lg font-semibold text-gray-900 mb-2">
                Form Name *
              </label>
              <input
                id="formName"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter form name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="formDescription" className="block text-lg font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your survey"
              />
            </div>

            {/* Horizontal Separator */}
            <hr className="border-gray-300" />

            {/* Question Types - Horizontal Layout */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('text')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Text Input
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('textarea')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Long Text
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('radio')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Multiple Choice
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('checkbox')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Checkboxes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('select')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dropdown
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addQuestion('rating')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Rating Scale
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Added</h3>
                    <p className="text-gray-600 mb-4">
                      Start building your survey by adding questions using the buttons above.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                questions.map(renderQuestionEditor)
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}