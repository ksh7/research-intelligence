import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  Globe,
  Lock,
  BarChart3,
  ExternalLink,
  Settings,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useProjectStore } from '../stores/projectStore';
import { useFormStore } from '../stores/formStore';
import { ProjectModal } from '../components/projects/ProjectModal';
import { FormBuilder } from '../components/forms/FormBuilder';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, deleteProject, updateProject, fetchProjects } = useProjectStore();
  const { forms, fetchForms, deleteForm } = useFormStore();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading project with ID:', id);
        
        // Fetch projects first
        await fetchProjects();
        console.log('Projects fetched, total count:', projects.length);
        
      } catch (error) {
        console.error('Error loading projects:', error);
        navigate('/projects');
      }
    };

    loadData();
  }, [id, navigate, fetchProjects]);

  // Second effect to find project and load forms after projects are loaded
  useEffect(() => {
    if (projects.length > 0 && id) {
      console.log('Looking for project with ID:', id);
      console.log('Available projects:', projects.map(p => ({ id: p.id, name: p.name })));
      
      const foundProject = projects.find(p => p.id === id);
      console.log('Found project:', foundProject);
      
      if (foundProject) {
        setProject(foundProject);
        // Load forms for this project
        fetchForms(id).then(() => {
          console.log('Forms loaded for project');
          setLoading(false);
        }).catch(error => {
          console.error('Error loading forms:', error);
          setLoading(false);
        });
      } else {
        console.log('Project not found, redirecting to projects page');
        setLoading(false);
        navigate('/projects');
      }
    } else if (projects.length === 0 && !loading) {
      // If no projects exist at all
      console.log('No projects found');
      setLoading(false);
      navigate('/projects');
    }
  }, [projects, id, navigate, fetchForms]);

  const handleDeleteProject = async () => {
    if (!project) return;
    
    const confirmMessage = `Are you sure you want to delete "${project.name}"? This will permanently delete the project and all associated forms and responses. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteProject(project.id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (!project) return;
    
    setUpdatingVisibility(true);
    try {
      const newVisibility = !project.is_public;
      await updateProject(project.id, { is_public: newVisibility });
      setProject({ ...project, is_public: newVisibility });
    } catch (error) {
      console.error('Error updating project visibility:', error);
      alert('Failed to update project visibility. Please try again.');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleDeleteForm = async (formId: string, formName: string) => {
    const confirmMessage = `Are you sure you want to delete the form "${formName}"? This will permanently delete all responses. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteForm(formId);
        // Refresh forms after deletion
        fetchForms(project.id);
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Failed to delete form. Please try again.');
      }
    }
  };

  // Show loading spinner while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show not found message if project doesn't exist
  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Project not found</div>
        <Link to="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const projectForms = forms.filter(form => form.project_id === project.id);
  const activeForms = projectForms.filter(form => form.is_accepting_responses);
  const totalResponses = 0; // This would be calculated from actual responses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">
              Created {new Date(project.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    project.is_public 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.is_public ? (
                      <>
                        <Globe className="w-4 h-4 inline mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 inline mr-1" />
                        Private
                      </>
                    )}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900">
                    {project.description || 'No description provided for this project.'}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Project Visibility</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.is_public 
                          ? 'Project findings are visible to the public' 
                          : 'Project findings are private to your account'
                        }
                      </p>
                    </div>
                    <Button
                      variant={project.is_public ? "secondary" : "primary"}
                      onClick={handleToggleVisibility}
                      loading={updatingVisibility}
                      size="sm"
                    >
                      {project.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Statistics */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{projectForms.length}</div>
                  <div className="text-sm text-gray-500">Total Research Forms</div>
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
                  <div className="text-2xl font-bold text-gray-900">{activeForms.length}</div>
                  <div className="text-sm text-gray-500">Active Research orms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
                  <div className="text-sm text-gray-500">Total Responses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Research Forms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Research Forms</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage surveys and data collection forms for this project
              </p>
            </div>
            <Button onClick={() => setShowFormBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Research Form
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projectForms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">No forms created yet</div>
              <Button onClick={() => setShowFormBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Research Form
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projectForms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{form.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            form.is_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {form.is_public ? 'Public' : 'Private'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            form.is_accepting_responses 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {form.is_accepting_responses ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {form.description || 'No description provided'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created {new Date(form.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          0 responses
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {form.is_public && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/research/${form.id}`, '_blank')}
                          title="View Public Form"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Link to={`/forms/${form.id}/responses`}>
                        <Button variant="ghost" size="sm" title="View Responses">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" title="Form Settings">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingForm(form)}
                        title="Edit Form"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteForm(form.id, form.name)}
                        title="Delete Form"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      {showEditModal && (
        <ProjectModal
          project={project}
          onClose={() => {
            setShowEditModal(false);
            // Update local project state if it was modified
            const updatedProject = projects.find(p => p.id === project.id);
            if (updatedProject) {
              setProject(updatedProject);
            }
          }}
        />
      )}

      {/* Form Builder */}
      {(showFormBuilder || editingForm) && (
        <FormBuilder
          projectId={project.id}
          form={editingForm}
          onClose={() => {
            setShowFormBuilder(false);
            setEditingForm(null);
            // Refresh forms after creating/editing
            fetchForms(project.id);
          }}
        />
      )}
    </div>
  );
}