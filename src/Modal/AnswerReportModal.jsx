import React, { useState } from 'react';
import { API_URL } from '../reduxServices/api/InterviewApi';
import { jsPDF } from 'jspdf';

import {
  X,
  FileText,
  Mail,
  Briefcase,
  Building2,
  CalendarDays,
  TimerReset,
  UserRound,
  Smile,
  Monitor,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react';

const AnswerReportModal = ({ interview, onClose }) => {
  if (!interview) return null;

  const answers = Array.isArray(interview.answers) ? interview.answers : [];
  console.log('answers', answers);
  const firstAnsAt = answers[0]?.created_at ? new Date(answers[0]?.created_at) : null;
  const lastAnsAt = answers[answers.length - 1]?.created_at
    ? new Date(answers[answers.length - 1]?.created_at)
    : null;
  const totalMinutes = firstAnsAt && lastAnsAt
    ? Math.max(1, Math.round((lastAnsAt - firstAnsAt) / 1000 / 60))
    : interview?.durationMinutes || null;

  // Scores (fallback to simple averages when not provided)
  const numericRatings = answers
    .map(a => (typeof a?.rating === 'number' ? a.rating : null))
    .filter(v => v !== null);
  const avgSkillScore = numericRatings.length
    ? Math.round((numericRatings.reduce((s, v) => s + v, 0) / numericRatings.length) * 10) // scale ~100
    : interview?.scores?.skill ?? null;
  const avgCommScore = (() => {
    const comm = answers
      .map(a => (typeof a?.communication_score === 'number' ? a.communication_score : null))
      .filter(v => v !== null);
    if (comm.length) return Math.round((comm.reduce((s, v) => s + v, 0) / comm.length) * 10);
    return interview?.scores?.communication ?? null;
  })();

  const experience = Array.isArray(interview?.experience) ? interview.experience : [];
  const proctor = interview?.proctoring || null;
  const photos = Array.isArray(interview?.photos) ? interview.photos : [];
  const [isLoading, setIsLoading] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Q&A PDF states
  const [qaPdfUrl, setQaPdfUrl] = useState(null);
  const [showQaPdfModal, setShowQaPdfModal] = useState(false);
  const [isQaLoading, setIsQaLoading] = useState(false);

  const generatePdf = async () => {
    if (photos.length === 0) return;
    
    setIsLoading(true);
    try {
      const doc = new jsPDF();
      
      // Add cover page
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text('Interview Photos', 105, 50, { align: 'center' });
      
      // Add candidate details
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(`Candidate: ${interview?.name || 'N/A'}`, 20, 80);
      doc.text(`Email: ${interview?.email || 'N/A'}`, 20, 90);
      doc.text(`Role: ${interview?.role || 'N/A'}`, 20, 100);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 110);
      
      // Set up grid layout (2x3)
      const imagesPerPage = 6;
      const gridCols = 2;
      const gridRows = 3;
      const pageWidth = doc.internal.pageSize.width - 20; // 10mm margins on each side
      const pageHeight = doc.internal.pageSize.height - 20;
      
      // Calculate image dimensions to fit 2x3 grid with padding
      const padding = 10;
      const imgWidth = (pageWidth - (padding * (gridCols + 1))) / gridCols;
      const imgHeight = (pageHeight - (padding * (gridRows + 1))) / gridRows;
      
      // Add first page
      doc.addPage();
      
      for (let i = 0; i < photos.length; i++) {
        // Add new page if needed (every 6 images)
        if (i > 0 && i % imagesPerPage === 0) {
          doc.addPage();
        }
        
        const photoUrl = photos[i].image.startsWith('http') ? photos[i].image : `${API_URL}${photos[i].image}`;
        
        // Fetch the image
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const imgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        
        // Calculate position in grid
        const pageIndex = Math.floor(i / imagesPerPage);
        const indexInPage = i % imagesPerPage;
        const row = Math.floor(indexInPage / gridCols);
        const col = indexInPage % gridCols;
        
        // Calculate position with padding
        const x = 10 + (col * (imgWidth + padding));
        const y = 10 + (row * (imgHeight + padding));
        
        // Add image to PDF
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => {
          img.onload = () => {
            // Calculate dimensions to maintain aspect ratio
            let finalWidth = imgWidth;
            let finalHeight = (img.height * imgWidth) / img.width;
            
            // If image is too tall, scale it down
            if (finalHeight > imgHeight) {
              const scale = imgHeight / finalHeight;
              finalWidth *= scale;
              finalHeight = imgHeight;
            }
            
            // Center the image in the grid cell
            const xOffset = x + ((imgWidth - finalWidth) / 2);
            const yOffset = y + ((imgHeight - finalHeight) / 2);
            
            doc.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
            
            // Add timestamp below image
            doc.setFontSize(8);
            const timestamp = new Date(photos[i].uploaded_at).toLocaleString();
            const textWidth = doc.getStringUnitWidth(timestamp) * 8 / doc.internal.scaleFactor;
            const textX = x + ((imgWidth - textWidth) / 2);
            
            doc.text(timestamp, textX, y + imgHeight + 5);
            resolve();
          };
        });
      }
      
      // Generate PDF URL for preview
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setShowPdfModal(true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `interview_photos_${interview?.name || 'candidate'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowPdfModal(false);
  };

  // Generate Q&A PDF for Skill based round
  const generateQaPdf = async () => {
    const qaList = Array.isArray(interview.answers) ? interview.answers : [];
    if (qaList.length === 0) {
      alert('No Q&A data available for Skill based round.');
      return;
    }

    setIsQaLoading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Skill Based Round - Q&A', 40, 50);

      // Candidate Meta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const meta = [
        `Candidate: ${interview?.name || 'N/A'}`,
        `Email: ${interview?.email || 'N/A'}`,
        `Technology: ${interview?.technology || 'N/A'}`,
        `Date: ${lastAnsAt ? lastAnsAt.toLocaleString() : new Date().toLocaleString()}`,
      ];
      let y = 70;
      meta.forEach((m) => {
        doc.text(m, 40, y);
        y += 16;
      });

      y += 10;

      // Content
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const maxWidth = pageWidth - margin * 2;
      const lineGap = 6;

      qaList.forEach((item, idx) => {
        // Check page break
        const startY = y;
        const qPrefix = `Q${idx + 1}. `;
        const question = item?.question?.text || '—';
        const answer = item?.answer_text || '—';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const qLines = doc.splitTextToSize(qPrefix + question, maxWidth);
        const qHeight = qLines.length * (12 + lineGap);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const aLines = doc.splitTextToSize(`- ${answer}`, maxWidth);
        const aHeight = aLines.length * (11 + lineGap);

        const blockHeight = qHeight + aHeight + 14;
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + blockHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        // Draw question
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(qLines, margin, y);
        y += qHeight;

        // Draw answer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(aLines, margin, y);
        y += aHeight + 10;

        // Optional meta per item (rating/correct)
        const metaLine = [];
        if (typeof item?.rating === 'number') metaLine.push(`Rating: ${item.rating}`);
        // if (typeof item?.is_correct === 'boolean') metaLine.push(`Correct: ${item.is_correct ? 'Yes' : 'No'}`);
        if (metaLine.length) {
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(metaLine.join('   '), margin, y);
          doc.setTextColor(0);
          y += 16;
        }

        // Subtle divider line
        doc.setDrawColor(230);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setQaPdfUrl(url);
      setShowQaPdfModal(true);
    } catch (e) {
      console.error('Error generating Q&A PDF:', e);
      alert('Failed to generate Q&A PDF. Please try again.');
    } finally {
      setIsQaLoading(false);
    }
  };

  const handleDownloadQaPdf = () => {
    if (!qaPdfUrl) return;
    const link = document.createElement('a');
    link.href = qaPdfUrl;
    link.download = `skill_round_QA_${interview?.name || 'candidate'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowQaPdfModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal Panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
              </div>
              <h1 className="text-white text-xl font-semibold">INTERVIEW REPORT</h1>
            </div>
            <div className="flex items-center gap-2">
              {interview?.upload_doc && (
                  <a
                    href={`${API_URL}${interview.upload_doc}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sm:inline-flex px-3 py-1.5 rounded-md bg-white/15 text-white text-sm hover:bg-white/25 border border-white/20"
                  >
                  View CV ↗
                  </a>
              )}
              {photos.length > 0 && (
                <button
                  onClick={generatePdf}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white/20 text-white text-sm rounded border border-white/30 hover:bg-white/30 disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'View Snapshots ↗'}
                </button>
              )}
              <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Candidate Info Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {interview.photo ? (
                  <img
                    src={`${API_URL}${interview.photo}`}
                    alt={interview.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {(interview.name || '?')
                      .split(' ')
                      .map(n => n[0])
                      .slice(0,2)
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{interview?.name || 'Kunal'}</h2>
                <p className="text-sm text-gray-600 mb-1">{`${interview?.technology} Developer` || 'Full Stack Developer'}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{interview?.email || 'kunal.pd@gmail.com'}</span>
                </div>
              </div>
            </div>

            {/* Round-wise Scores */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-2">ROUND-WISE SCORES</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500">{avgSkillScore || '35'}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                  <div className="text-xs text-gray-500">Skill based</div>
                </div>
                {/* <div>
                  <div className="text-2xl font-bold text-gray-400">0</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                  <div className="text-xs text-gray-500">Coding</div>
                </div> */}
                {/* <div>
                  <div className="text-2xl font-bold text-orange-500">{Math.round((avgSkillScore || 35) * 0.7)}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                  <div className="text-xs text-gray-500">Behavioral</div>
                </div> */}
                <div>
                  <div className="text-2xl font-bold text-orange-500">{Math.round((interview?.communication?.Grammar + interview?.communication?.ProfessionalLanguage) / 2 || 43) * 10}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                  <div className="text-xs text-gray-500">Communication</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Meta Info */}
          <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total work experience</div>
              <div className="text-lg font-semibold">{interview?.experience || '6 years'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Current role</div>
              <div className="text-lg font-semibold">{interview?.technology || 'Full Stack Developer'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Current company</div>
              <div className="text-lg font-semibold">{interview?.company || 'MindNavigator'}</div>
            </div>
          </div>

          {/* Interview Date and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Interview date —</div>
              <div className="text-sm font-medium">{lastAnsAt ? lastAnsAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Oct 2025'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total time spent —</div>
              <div className="text-sm font-medium">{totalMinutes ? `${totalMinutes} minutes` : '29 minutes'}</div>
            </div>
          </div>

          {/* Experience Section */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Experience</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {[
                  { company: 'MindNavigator', duration: '18 months' },
                  { company: 'EZDivorce', duration: '12 months' },
                  { company: 'Octawise', duration: '18 months' },
                  { company: 'Lending Hub', duration: '18 months' },
                  { company: 'Employee Identity Portal', duration: '06 months' }
                ].map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{exp.company}</div>
                    <div className="text-sm text-gray-600 font-medium">{exp.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interview Rounds Completed */}
          <section>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Interview rounds completed</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">{Math.round((avgSkillScore || 35) / 10)}</span>
                  </div>
                  <span className="text-sm text-gray-600">/ 100 SCORE</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={generateQaPdf}
                    disabled={isQaLoading}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 disabled:opacity-50"
                    title="View Skill based round Q&A as PDF"
                  >
                    {isQaLoading ? 'Generating…' : 'Skill based round ↗'}
                  </button>
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">Behaviour round ↗</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">Coding round ↗</span>
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">Screening round ↗</span>
                </div>
              </div>
            </div>

            {/* Skill Based Round Details */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Skill based round</h5>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Stats</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {[
                      { skill: 'Umbraco Development', score: '7.5' },
                      { skill: 'DI', score: '6.5' },
                      { skill: 'Mvc Web Api', score: '7.5' },
                      { skill: 'Mvc Web', score: '6.5' },
                      { skill: 'Git', score: '7.5' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{item.skill}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-orange-400 rounded-full" 
                              style={{ width: `${(parseFloat(item.score) / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-orange-600">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { skill: 'Sql', score: '6.5' },
                      { skill: 'Communication', score: '6.5' },
                      { skill: 'Repository', score: '7.5' },
                      { skill: 'Entity Framework', score: '6.5' },
                      { skill: 'Unit Of Work', score: '6.5' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{item.skill}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-orange-400 rounded-full" 
                              style={{ width: `${(parseFloat(item.score) / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-orange-600">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Strengths</div>
                      <div className="text-sm text-gray-700 mt-1">
                        No strong areas were identified based on the evaluation scores.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Areas to improve</div>
                      <div className="text-sm text-gray-700 mt-1">
                        The candidate could benefit from further development in umbraco development, di, mvc web api, mvc web, git, sql, communication repository, entity framework, unit of work.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Communication Analysis */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Communication analysis</h4>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">{Math.round((interview?.communication?.Grammar + interview?.communication?.ProfessionalLanguage) / 2 || 43) * 10}</span>
                </div>
                <span className="text-sm text-gray-600">/ 100 SCORE</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-700 mb-4">
                <span className="font-semibold">Stats</span>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Grammar</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-400 rounded-full" style={{ width: interview?.communication?.Grammar * 5 || 0 }}></div>
                      </div>
                      <span className="text-sm font-medium text-orange-600">{interview?.communication?.Grammar || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Professional Language</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-400 rounded-full" style={{ width: interview?.communication?.ProfessionalLanguage * 5 || 0 }}></div>
                      </div>
                      <span className="text-sm font-medium text-orange-600">{interview?.communication?.ProfessionalLanguage || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-900 text-sm mb-2">Communication skills review</div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">•</span>
                      <span><span className="font-semibold">Overall Grammar Explanation: </span>{interview?.communication?.OverallGrammarExplanation}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">•</span>
                      <span><span className="font-semibold">Overall Professional Language Explanation: </span>{interview?.communication?.OverallProfessionalLanguageExplanation}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">•</span> 
                      <span><span className="font-semibold">Overall Language Used: </span>{interview?.communication?.OverallLanguageUsed}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Proctoring */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Proctoring</h4>
            <div className="grid grid-cols-3 gap-4">
              {/* No Distractions */}
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  <Monitor className="w-8 h-8 text-gray-500" />
                </div>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">{interview?.tab_count > 0 ? 'Distractions' : 'No Distractions'}</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {interview?.tab_count
                    ? `You ${interview.tab_count === 0 ? 'stayed fully focused with 0 tab switches.' : `had ${interview.tab_count} tab switch${interview.tab_count > 1 ? 'es' : ''}.`}`
                    : 'You stayed fully focused with 0 tab switches.'}
                </div>
              </div>

              {/* Single Person Detected */}
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  <UserRound className="w-8 h-8 text-gray-500" />
                </div>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">Single Person Detected</span>
                </div>
                <div className="text-xs text-gray-600">
                  Only one face detected throughout the session, indicating the user was alone and focused also 0 multiple face detected during assessment.
                </div>
              </div>

              {/* Good Expression */}
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  <Smile className="w-8 h-8 text-gray-500" />
                </div>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">Good</span>
                </div>
                <div className="text-xs text-gray-600">
                  Facial expressions showed strong focus and interest.
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 text-sm mb-2">Proctoring review</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Tab Switches Detected:</span> No tab switches were recorded during the session, indicating consistent focus throughout the interview.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Face Detection:</span> Only one face was visible throughout the session, indicating the user was alone and focused also 0 multiple face detected during assessment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Facial Expression:</span> The candidate appeared relaxed and composed throughout the interview.</span>
                </li>
              </ul>
              
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-600">
                <span className="font-semibold">Internet:</span> The candidate experienced poor internet connectivity during the assessment.
              </div>
            </div>
          </section>

          {/* Final Recommendation */}
          <section>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Final recommendation</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>The candidate demonstrates solid technical knowledge across various programming concepts and frameworks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Communication skills could be enhanced in terms of clarity and professionalism, particularly in structuring sentences and avoiding informal language.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>The candidate shows areas for improvement in time management, problem-solving, keen collaboration and communication skills.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Coding skills require significant development in all areas, including code optimization, error handling, efficiency, and algorithmic thinking.</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Homans</div>
                    <div className="text-xs opacity-90">connect@homans.ai</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-xs font-bold">AI</span>
                  </div>
                  <span className="text-sm font-medium">Homan's AI Interviewer has rated this candidate as</span>
                  <span className="bg-white text-red-500 px-2 py-1 rounded text-sm font-bold">Poor</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-white">Close</button>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      {showPdfModal && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">PDF Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Q&A PDF Preview Modal */}
      {showQaPdfModal && qaPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Skill Round Q&A - PDF Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadQaPdf}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowQaPdfModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                src={qaPdfUrl}
                className="w-full h-full"
                title="Skill Round Q&A PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerReportModal;
