import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FolderOpen, FileText, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useProjectStore } from '../stores/projectStore';
import { useFormStore } from '../stores/formStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Dashboard() {
  const { projects, fetchProjects } = useProjectStore();
  const { forms, fetchForms } = useFormStore();
  const { user } = useAuthStore();
  const [totalResponses, setTotalResponses] = useState(0);
  const [responsesByDay, setResponsesByDay] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchForms();
      await loadTotalResponses();
    };
    loadData();
  }, [user]);

  const loadTotalResponses = async () => {
    try {
      // Get total responses count
      const { data: allResponses, error: responsesError } = await supabase
        .from('form_responses')
        .select(`
          *,
          research_forms!inner(
            research_projects!inner(
              user_id
            )
          )
        `)
        .eq('research_forms.research_projects.user_id', user?.id);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        return;
      }

      const totalCount = allResponses?.length || 0;
      setTotalResponses(totalCount);

      // Get responses by day for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentResponses = allResponses?.filter(r => 
        new Date(r.submitted_at) >= sevenDaysAgo
      ) || [];

      // Process responses by day
      const dayData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        const dayResponses = recentResponses.filter(r => {
          const responseDate = new Date(r.submitted_at);
          return responseDate.toDateString() === date.toDateString();
        });
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dayResponses.length,
        };
      });

      setResponsesByDay(dayData);
    } catch (error) {
      console.error('Error loading response stats:', error);
    }
  };

  const lineChartData = {
    labels: responsesByDay.map(d => d.date),
    datasets: [
      {
        label: 'Responses',
        data: responsesByDay.map(d => d.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: forms.slice(0, 5).map(f => f.name),
    datasets: [
      {
        label: 'Responses',
        data: forms.slice(0, 5).map(() => Math.floor(Math.random() * 50) + 10), // Temporary data
        backgroundColor: '#10B981',
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Active', 'Completed', 'Draft'],
    datasets: [
      {
        data: [
          forms.filter(f => f.is_accepting_responses).length,
          forms.filter(f => !f.is_accepting_responses && f.is_public).length,
          forms.filter(f => !f.is_public).length,
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's your research overview.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                <div className="text-sm text-gray-500">Total Research Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{forms.length}</div>
                <div className="text-sm text-gray-500">Total Research Forms</div>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {forms.filter(f => f.is_accepting_responses).length}
                </div>
                <div className="text-sm text-gray-500">Ongoing Research</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Response Trends</h3>
            <p className="text-sm text-gray-500">Daily responses over the last 7 days</p>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line 
                data={lineChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Research Form Performance</h3>
            <p className="text-sm text-gray-500">Top performing forms by responses</p>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar 
                data={barChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Research Form Status</h3>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Doughnut 
                data={doughnutChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Research Projects</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No projects yet. Create your first project to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}