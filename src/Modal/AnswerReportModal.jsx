import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../reduxServices/api/InterviewApi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  const calculateScore = (answers) => {
    if (!answers || answers.length === 0) return 0;

    const totalRating = answers.reduce((sum, a) => sum + (a.rating || 0), 0);
    const maxScore = answers.length * 10; // assuming each rating is out of 10
    return (totalRating / maxScore) * 100;
  };

  const finalScore = calculateScore(answers);
  console.log("Score out of 100:", finalScore.toFixed(2));

  const firstAnsAt = answers[0]?.created_at ? new Date(answers[0]?.created_at) : null;
  const lastAnsAt = answers[answers.length - 1]?.created_at
    ? new Date(answers[answers.length - 1]?.created_at)
    : null;
  const totalMinutes = firstAnsAt && lastAnsAt
    ? Math.max(1, Math.round((lastAnsAt - firstAnsAt) / 1000 / 60))
    : interview?.durationMinutes || null;

  // Proctoring: dynamic tab switch message
  const getTabSwitchMessage = (count) => {
    const c = Number.isFinite(count) ? count : 0;
    if (c === 0) {
      return 'No tab switches were recorded during the session, indicating consistent focus throughout the interview.';
    } else if (c === 1) {
      return '1 tab switch was recorded. Candidate briefly switched focus during the session.';
    }
    return `${c} tab switches were recorded. Candidate frequently switched tabs, indicating distraction or divided attention.`;
  };
  const tabSwitchMessage = getTabSwitchMessage(interview?.tab_count);

  const getFaceDetectionMessage = (totalFaces) => {
    const faces = Number.isFinite(totalFaces) ? totalFaces : 0;

    if (faces === 0) {
      return "Only one face detected throughout the session, indicating the user was alone and focused also 0 multiple face detected during assessment.";
    }
    return `${faces} faces were detected throughout the session, indicating the possible presence of multiple people or interruptions during the assessment.`;

  };

  const totalFaces = interview?.emotion_summary?.total_faces - interview?.emotion_summary?.total_photos;
  const faceMessage = getFaceDetectionMessage(totalFaces);

  const facialExpression = interview?.emotion_summary?.report_lines || [];
  const maxExpression =
    facialExpression.length > 0
      ? facialExpression.reduce((a, b) =>
        parseInt(b.match(/\((\d+)%\)/)?.[1] || 0) >
          parseInt(a.match(/\((\d+)%\)/)?.[1] || 0)
          ? b
          : a
      )
      : "No facial data available.";

  const facialExpressionMessage = (Face) => {

    if (String(Face) === 'Neutral') {
      return "Candidate maintained a steady, controlled demeanor throughout the session.They weren’t overly expressive but remained relaxed and balanced.";
    }
    if (String(Face) === 'Good') {
      return "Candidate’s face consistently showed engagement, attentiveness, and concentration.They appeared genuinely interested in the questions, maintained good eye contact, and reacted appropriately.";
    }
    if (String(Face) === 'Bad') {
      return "Candidate showed signs of tension, anxiety, or loss of focus.";
    }
  };

  const facialExpressionMes = facialExpressionMessage(maxExpression.split(' ')[0]);

  // Calculate experience duration from company data
  const calculateExperienceDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate === 'running' ? new Date() : new Date(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  // Get company data from API
  const companies = Array.isArray(interview?.company) ? interview.company : [];

  // ESC key handler for closing modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowPdfModal(false);
        setShowQaPdfModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

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

  const pdfRef = useRef(null);
  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) {
      alert('Could not find content to export');
      return;
    }

    // Apply safe colors to avoid oklab/oklch crash
    element.classList.add("pdf-mode");
    
    // Temporarily remove max-height and overflow to capture full content
    const originalStyle = {
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow,
      height: element.style.height
    };
    
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.style.height = 'auto';

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        height: element.scrollHeight,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Create a custom page size that fits the entire content
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4 size as default
      });
      
      // Calculate dimensions to fit content on one page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create a custom page height that accommodates the full content
      const customPageHeight = Math.max(297, imgHeight); // At least A4 height
      pdf.internal.pageSize.setHeight(customPageHeight);
      
      // Add the full image as a single page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const pageHeight = pdf.internal.pageSize.getHeight();

     // Add visible text
      pdf.setTextColor(0, 0, 255);
      pdf.setFontSize(12);
      pdf.text("View Question_Ans", 20, pageHeight - 15);

    // Add REAL clickable link
      pdf.link(20, pageHeight - 20, 80, 10, {
      url: `${API_URL}${interview.q_ans_file}`,
});
      
      pdf.save(`interview_report_${interview?.name || 'candidate'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      // Restore original styles and remove pdf-mode
      element.style.maxHeight = originalStyle.maxHeight;
      element.style.overflow = originalStyle.overflow;
      element.style.height = originalStyle.height;
      element.classList.remove("pdf-mode");
    }
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
              {interview?.snapshots && (
                <a
                  href={`${API_URL}${interview.snapshots}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:inline-flex px-3 py-1.5 rounded-md bg-white/15 text-white text-sm hover:bg-white/25 border border-white/20"
                >
                  View Snapshots ↗
                </a>
              )}
              <button 
                onClick={downloadPDF}
                className="px-3 py-1.5 bg-white/20 text-white text-sm rounded border border-white/30 hover:bg-white/30"
              >
                Download PDF
              </button>
              <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div ref={pdfRef} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

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
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{interview?.name}</h2>
                <p className="text-sm text-gray-600 mb-1">{`${interview?.technology} Developer`}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{interview?.email}</span>
                </div>
              </div>
            </div>

            {/* Round-wise Scores */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-2">ROUND-WISE SCORES</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500">{finalScore.toFixed(0) || '35'}</div>
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
              <div className="text-lg font-semibold">{interview?.experience || 'Not specified'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Current role</div>
              <div className="text-lg font-semibold">{interview?.technology || 'Not specified'}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Current company</div>
              <div className="text-lg font-semibold">{companies.length > 0 && companies[companies.length - 1]?.company_name || 'Not specified'}</div>
            </div>
          </div>

          {/* Interview Date and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Interview date —</div>
              <div className="text-sm font-medium">{lastAnsAt ? lastAnsAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total time spent —</div>
              <div className="text-sm font-medium">{totalMinutes ? `${totalMinutes} minutes` : 'Not specified'}</div>
            </div>
          </div>

          {/* Experience Section */}
          {companies.length > 0 ? (
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Experience</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {companies.map((company, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {calculateExperienceDuration(company.start_date, company.end_date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Experience</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-8 text-center text-gray-500">
                  No experience data available
                </div>
              </div>
            </section>
          )}

          {/* Interview Rounds Completed */}
          <section>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Skill Assessment Round</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">{Math.round((finalScore.toFixed(0) || 35) / 10)}</span>
                  </div>
                  <span className="text-sm text-gray-600">/ 100 SCORE</span>
                </div>
              </div>

              <div className="flex justify-center">

                {interview?.q_ans_file && (
                <a
                  href={`${API_URL}${interview.q_ans_file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  View Question_Ans ↗
                </a>
              )}
              </div>
            </div>

            {/* Skill Based Round Details */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Skill based round</h5>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Stats</span>
                </div>

                {answers.length > 0 ? (
                  <div className="text-sm text-gray-600">
                    Based on {answers.length} question{answers.length > 1 ? 's' : ''} answered in the skill assessment round.
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No skill assessment data available for this interview.
                  </div>
                )}
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
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${totalFaces <= 1 ? 'bg-green-600' : 'bg-green-600'
                      }`}
                  >
                    {totalFaces <= 1 ? 'Single Person Detected' : 'Multiple Faces Detected'}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  {totalFaces <= 1
                    ? 'Only one face detected throughout the session'
                    : `${totalFaces} faces were detected throughout the session`}
                </div>

              </div>

              {/* Good Expression */}
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  <Smile className="w-8 h-8 text-gray-500" />
                </div>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">{maxExpression.split(' ')[0]}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {maxExpression.split(":")[1]?.trim() || "No expression data available."}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 text-sm mb-2">Proctoring review</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Tab Switches Detected:</span> {tabSwitchMessage}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Face Detection:</span> {faceMessage}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><span className="font-semibold">Facial Expression:</span> {facialExpressionMes}</span>
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
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Shine</div>
                    <div className="text-xs opacity-90">connect@shine.ai</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-xs font-bold">AI</span>
                  </div>
                  <span className="text-sm font-medium">Shine AI Interviewer has rated this candidate as</span>
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
