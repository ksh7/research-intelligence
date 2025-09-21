import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, ExternalLink, Eye, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useFormStore } from '../stores/formStore';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export function Forms() {
  const { forms, responses, loading, fetchForms, fetchFormResponses, deleteForm } = useFormStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchForms(); // Fetch all forms across all projects
    };
    loadData();
  }, [fetchProjects, fetchForms, fetchFormResponses]);

  useEffect(() => {
    const loadResponseCounts = async () => {
      if (forms.length === 0) return;
      
      // Load response counts for all forms
      const counts: Record<string, number> = {};
      
      try {
        // Get all responses for user's forms in one query
        const { data: allResponses, error } = await supabase
          .from('form_responses')
          .select(`
            form_id,
            research_forms!inner(
              research_projects!inner(
                user_id
              )
            )
          `)
          .eq('research_forms.research_projects.user_id', user?.id);

        if (error) {
          console.error('Error fetching response counts:', error);
          return;
        }

        // Count responses per form
        forms.forEach(form => {
          const formResponses = allResponses?.filter(r => r.form_id === form.id) || [];
          counts[form.id] = formResponses.length;
        });

        setResponseCounts(counts);
      } catch (error) {
        console.error('Error loading response counts:', error);
        // Set all counts to 0 on error
        forms.forEach(form => {
          counts[form.id] = 0;
        });
        setResponseCounts(counts);
      }
    };

    loadResponseCounts();
  }, [forms]);
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getProjectName(form.project_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && form.is_accepting_responses) ||
                         (filterStatus === 'inactive' && !form.is_accepting_responses);
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteForm = async (formId: string, formName: string) => {
    const confirmMessage = `Are you sure you want to delete the form "${formName}"? This will permanently delete all responses. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteForm(formId);
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Failed to delete form. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no forms exist, show message to go to projects
  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Forms</h1>
            <p className="mt-2 text-gray-600">Manage all your research forms across projects</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Forms Created Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You need to create a project first, then add forms to it. Forms are organized within research projects.
            </p>
            <Link to="/projects">
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Go to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Forms</h1>
          <p className="mt-2 text-gray-600">Manage all your research forms across projects</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search forms or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Forms</option>
          <option value="active">Active Forms</option>
          <option value="inactive">Inactive Forms</option>
        </select>
      </div>

      {/* Forms Table */}
      {filteredForms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No forms found matching your criteria.' 
                : 'No forms available.'
              }
            </div>
            {!searchTerm && filterStatus === 'all' && (
              <Link to="/projects">
                <Button className="mt-4">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Go to Projects
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Research Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{form.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/projects/${form.project_id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {getProjectName(form.project_id)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            form.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {form.is_public ? 'Public' : 'Private'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            form.is_accepting_responses ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {form.is_accepting_responses ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {responseCounts[form.id] || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(form.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {form.is_public && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/research/${form.id}`, '_blank')}
                              title="View Public Form"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Link to={`/forms/${form.id}/responses`}>
                            <Button variant="ghost" size="sm" title="View Responses">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/projects/${form.project_id}`}>
                            <Button variant="ghost" size="sm" title="Edit Form">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteForm(form.id, form.name)}
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}