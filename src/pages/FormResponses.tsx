import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Calendar,
  User,
  Clock,
  FileText,
  BarChart3,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useFormStore } from '../stores/formStore';
import { useProjectStore } from '../stores/projectStore';

export function FormResponses() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { forms, responses, fetchFormResponses, loading } = useFormStore();
  const { projects } = useProjectStore();
  
  const [form, setForm] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!formId) return;
      
      // Find form from store
      const foundForm = forms.find(f => f.id === formId);
      if (foundForm) {
        setForm(foundForm);
        
        // Find associated project
        const foundProject = projects.find(p => p.id === foundForm.project_id);
        setProject(foundProject);
        
        // Load responses for this form
        await fetchFormResponses(formId);
      } else {
        navigate('/forms');
      }
    };

    loadData();
  }, [formId, forms, projects, fetchFormResponses, navigate]);

  const filteredResponses = responses.filter(response => {
    if (!filterDate) return true;
    const responseDate = new Date(response.submitted_at).toDateString();
    const filterDateObj = new Date(filterDate).toDateString();
    return responseDate === filterDateObj;
  });

  const exportResponses = () => {
    if (responses.length === 0) {
      alert('No responses to export');
      return;
    }

    // Create CSV content
    const headers = ['Response ID', 'Submitted At', 'IP Address'];
    
    // Get all unique question keys from responses
    const questionKeys = new Set<string>();
    responses.forEach(response => {
      if (response.response_data) {
        Object.keys(response.response_data).forEach(key => questionKeys.add(key));
      }
    });
    
    headers.push(...Array.from(questionKeys));
    
    const csvContent = [
      headers.join(','),
      ...responses.map(response => {
        const row = [
          response.id,
          new Date(response.submitted_at).toLocaleString()
        ];
        
        // Add response data for each question
        questionKeys.forEach(key => {
          const value = response.response_data?.[key] || '';
          // Escape commas and quotes in CSV
          const escapedValue = typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
          row.push(escapedValue);
        });
        
        return row.join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.name || 'form'}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPublicFormUrl = () => {
    if (form?.public_link) {
      return `${window.location.origin}/research/${form.public_link}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Form not found</div>
        <Link to="/forms">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={project ? `/projects/${project.id}` : '/forms'}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {project ? 'Project' : 'Forms'}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {project && (
                <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-700">
                  {project.name}
                </Link>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getPublicFormUrl() && (
            <Button
              variant="secondary"
              onClick={() => window.open(getPublicFormUrl(), '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Form
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={exportResponses}
            disabled={responses.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Form Info and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Form Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="text-gray-900 mt-1">
                    {form.description || 'No description provided for this form.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Status</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        form.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.is_public ? 'Public' : 'Private'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        form.is_accepting_responses ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {form.is_accepting_responses ? 'Accepting Responses' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Created</h3>
                    <p className="text-gray-900 mt-1">
                      {new Date(form.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{responses.length}</div>
                  <div className="text-sm text-gray-500">Total Responses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {responses.length > 0 ? Math.round(responses.length / Math.max(1, Math.ceil((Date.now() - new Date(form.created_at).getTime()) / (1000 * 60 * 60 * 24)))) : 0}
                  </div>
                  <div className="text-sm text-gray-500">Avg. per Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responses Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Responses</h2>
              <p className="text-sm text-gray-600 mt-1">
                Individual responses submitted to this form
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResponses.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">
                {responses.length === 0 ? 'No responses yet' : 'No responses match your filter'}
              </div>
              <p className="text-sm text-gray-400">
                {responses.length === 0 
                  ? 'Responses will appear here once people start submitting your form'
                  : 'Try adjusting your date filter to see more responses'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResponses.map((response, index) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">
                        Response #{filteredResponses.length - index}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(response.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {response.response_data && (
                    <div className="space-y-2">
                      {Object.entries(response.response_data).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="ml-2 text-gray-900">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}