import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Task } from '../../types/task';

interface ReportButtonProps {
  tasks: Task[];
}

export default function ReportButton({ tasks }: ReportButtonProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(22);
    doc.text('Weekly Task Report', 14, 20);
    
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    doc.text(`Generated on: ${dateStr}`, 14, 28);
    
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    let yPos = 40;
    
    const drawTaskList = (title: string, list: Task[]) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${title} (${list.length})`, 14, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (list.length === 0) {
        doc.text('No tasks found.', 14, yPos);
        yPos += 8;
      }
      
      list.forEach((task, index) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        const status = task.completed ? 'Done' : 'Pending';
        const priority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        const text = `${index + 1}. [${priority}] ${task.title} - ${status}`;
        
        doc.text(text, 14, yPos);
        yPos += 7;
      });
      
      yPos += 5; // Extra padding
    };
    
    drawTaskList('Pending Tasks', pendingTasks);
    drawTaskList('Completed Tasks', completedTasks);
    
    doc.save('Weekly_Task_Report.pdf');
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <Download size={16} />
      <span>Download Report</span>
    </button>
  );
}
