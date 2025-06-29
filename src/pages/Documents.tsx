import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Edit,
  Share,
  Lock,
  Unlock,
  FileCheck,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../hooks/useAI';
import { useBlockchain } from '../hooks/useBlockchain';
import { isGeminiConfigured } from '../lib/gemini';
import { generateDocumentPDF } from '../lib/pdf-generator';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'legal-brief' | 'agreement' | 'court-filing' | 'template' | 'other';
  size: string;
  uploadDate: Date;
  status: 'analyzed' | 'pending' | 'error' | 'draft';
  summary?: string;
  tags: string[];
  isFavorite: boolean;
  content?: string;
  analysis?: any;
  isNotarized?: boolean;
  notarizationId?: string;
}

export default function Documents() {
  const { user } = useAuth();
  const { analyzeDocument, isLoading } = useAI();
  const { notarize, isNotarizing } = useBlockchain();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load documents from localStorage on mount
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = () => {
    const savedDocs = localStorage.getItem(`documents_${user?.id}`);
    if (savedDocs) {
      const docs = JSON.parse(savedDocs).map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      }));
      setDocuments(docs);
    } else {
      // Add some sample documents for demo
      const sampleDocs: Document[] = [
        {
          id: '1',
          name: 'Employment Agreement - Tech Corp',
          type: 'contract',
          size: '2.4 MB',
          uploadDate: new Date('2024-01-15'),
          status: 'analyzed',
          summary: 'Standard employment contract with competitive salary and benefits. Note: Non-compete clause may be overly broad.',
          tags: ['employment', 'contract', 'tech'],
          isFavorite: true,
          content: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on January 15, 2024, between Tech Corp, a Delaware corporation ("Company"), and John Doe ("Employee").

1. POSITION AND DUTIES
Employee shall serve as Senior Software Engineer and shall perform such duties as are customarily associated with such position.

2. COMPENSATION
Company shall pay Employee a base salary of $120,000 per year, payable in accordance with Company's standard payroll practices.

3. BENEFITS
Employee shall be entitled to participate in all employee benefit plans maintained by Company.

4. NON-COMPETE
During employment and for 24 months thereafter, Employee shall not engage in any business that competes with Company within a 50-mile radius.

5. CONFIDENTIALITY
Employee acknowledges that they will have access to confidential information and agrees to maintain such information in confidence.

This Agreement shall be governed by the laws of Delaware.`,
          analysis: {
            summary: 'Standard employment contract with competitive salary and benefits. The non-compete clause may be overly broad in scope and duration.',
            keyPoints: [
              'Base salary of $120,000 annually',
              'Standard employee benefits included',
              'Non-compete clause for 24 months within 50-mile radius',
              'Confidentiality obligations',
              'Governed by Delaware law'
            ],
            risks: [
              'Non-compete clause may be unenforceable due to broad scope',
              'No specific termination procedures outlined',
              'Limited severance provisions'
            ],
            recommendations: [
              'Consider negotiating shorter non-compete period',
              'Request clarification on termination procedures',
              'Review benefit details before signing'
            ],
            compliance: {
              jurisdiction: 'Delaware',
              compliant: true,
              issues: []
            },
            confidence: 85
          }
        },
        {
          id: '2',
          name: 'NDA Template - Consulting',
          type: 'template',
          size: '890 KB',
          uploadDate: new Date('2024-01-10'),
          status: 'analyzed',
          summary: 'Well-balanced NDA template suitable for consulting arrangements. Minor adjustments recommended for duration.',
          tags: ['nda', 'template', 'consulting'],
          isFavorite: false,
          content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into between [Company Name] ("Disclosing Party") and [Consultant Name] ("Receiving Party").

1. CONFIDENTIAL INFORMATION
Confidential Information includes all non-public information disclosed by Disclosing Party.

2. OBLIGATIONS
Receiving Party agrees to:
- Maintain confidentiality of all Confidential Information
- Use information solely for evaluation purposes
- Not disclose to third parties without written consent

3. TERM
This Agreement shall remain in effect for 5 years from the date of execution.

4. RETURN OF INFORMATION
Upon termination, Receiving Party shall return all Confidential Information.`,
          analysis: {
            summary: 'Standard NDA template with reasonable terms. The 5-year duration is appropriate for consulting arrangements.',
            keyPoints: [
              'Broad definition of confidential information',
              '5-year confidentiality period',
              'Return of information clause included',
              'Standard non-disclosure obligations'
            ],
            risks: [
              'Definition of confidential information could be more specific',
              'No carve-outs for publicly available information'
            ],
            recommendations: [
              'Add standard exceptions for publicly available information',
              'Consider mutual confidentiality provisions',
              'Include specific penalties for breach'
            ],
            compliance: {
              jurisdiction: 'United States',
              compliant: true,
              issues: []
            },
            confidence: 90
          }
        },
        {
          id: '3',
          name: 'Lease Agreement Draft',
          type: 'agreement',
          size: '1.2 MB',
          uploadDate: new Date('2024-01-08'),
          status: 'pending',
          summary: 'Residential lease agreement currently under review.',
          tags: ['lease', 'real-estate', 'draft'],
          isFavorite: false,
          content: `RESIDENTIAL LEASE AGREEMENT

Property Address: 123 Main Street, Anytown, State 12345
Lease Term: 12 months beginning February 1, 2024
Monthly Rent: $2,500

TENANT OBLIGATIONS:
- Pay rent by 1st of each month
- Maintain property in good condition
- No pets without written permission
- No smoking on premises

LANDLORD OBLIGATIONS:
- Provide habitable premises
- Make necessary repairs
- Respect tenant's quiet enjoyment

Security Deposit: $2,500 (refundable upon move-out inspection)`,
        },
      ];
      setDocuments(sampleDocs);
      saveDocuments(sampleDocs);
    }
  };

  const saveDocuments = (docs: Document[]) => {
    localStorage.setItem(`documents_${user?.id}`, JSON.stringify(docs));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFile(file);
    setShowUploadModal(true);
  };

  const processUpload = async () => {
    if (!uploadingFile || !user) return;

    try {
      // Read file content
      const fileContent = await readFileContent(uploadingFile);
      
      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadingFile.name,
        type: getDocumentType(uploadingFile.name),
        size: `${(uploadingFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date(),
        status: 'pending',
        tags: [],
        isFavorite: false,
        content: fileContent,
      };

      const updatedDocs = [newDocument, ...documents];
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      
      setShowUploadModal(false);
      setUploadingFile(null);
      
      toast.success('Document uploaded successfully!');
      
      // Auto-analyze if AI is configured
      if (isGeminiConfigured()) {
        analyzeDocumentContent(newDocument.id);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      reader.readAsText(file);
    });
  };

  const getDocumentType = (filename: string): Document['type'] => {
    const name = filename.toLowerCase();
    if (name.includes('contract')) return 'contract';
    if (name.includes('agreement')) return 'agreement';
    if (name.includes('template')) return 'template';
    if (name.includes('brief')) return 'legal-brief';
    if (name.includes('filing')) return 'court-filing';
    return 'other';
  };

  const analyzeDocumentContent = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document || !document.content) return;

    if (!isGeminiConfigured()) {
      toast.error('AI service is not configured. Please check your API keys.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeDocument(
        document.content,
        user?.jurisdiction || 'United States',
        'en',
        document.type
      );

      const updatedDoc = {
        ...document,
        status: 'analyzed' as const,
        summary: analysis.summary,
        analysis: analysis,
        tags: [...document.tags, ...analysis.keyPoints.slice(0, 3).map(point => 
          point.toLowerCase().split(' ')[0]
        )].filter((tag, index, arr) => arr.indexOf(tag) === index)
      };

      const updatedDocs = documents.map(d => d.id === documentId ? updatedDoc : d);
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      
      toast.success('Document analyzed successfully!');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      
      const updatedDoc = {
        ...document,
        status: 'error' as const,
        summary: 'Analysis failed. Please try again.'
      };

      const updatedDocs = documents.map(d => d.id === documentId ? updatedDoc : d);
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      
      toast.error('Document analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFavorite = (documentId: string) => {
    const updatedDocs = documents.map(doc => 
      doc.id === documentId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
  };

  const deleteDocument = (documentId: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
    toast.success('Document deleted successfully');
  };

  const notarizeDocument = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document || !document.content) return;

    try {
      const result = await notarize(
        document.content,
        document.name,
        {
          type: document.type,
          uploadDate: document.uploadDate.toISOString(),
          userId: user?.id
        }
      );

      const updatedDoc = {
        ...document,
        isNotarized: true,
        notarizationId: result.transactionId
      };

      const updatedDocs = documents.map(d => d.id === documentId ? updatedDoc : d);
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      
    } catch (error) {
      console.error('Notarization failed:', error);
    }
  };

  const downloadDocument = (document: Document) => {
    if (!document.content && !document.analysis) {
      toast.error('Document content not available');
      return;
    }

    // Generate PDF report
    try {
      generateDocumentPDF(document);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Fallback to text download
      const content = document.content || 'Document content not available';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name.replace(/\.[^/.]+$/, '') + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded as text file');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return b.uploadDate.getTime() - a.uploadDate.getTime();
    }
  });

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'analyzed':
        return 'Analyzed';
      case 'pending':
        return 'Analyzing...';
      case 'error':
        return 'Error';
      case 'draft':
        return 'Draft';
    }
  };

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'agreement':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'legal-brief':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'court-filing':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'template':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Please log in to access documents
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            You need to be logged in to manage your legal documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
            Document Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Upload, analyze, and manage your legal documents with AI-powered insights.
          </p>
          
          {!isGeminiConfigured() && (
            <div className="mt-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                <span className="text-warning-700 dark:text-warning-400 font-medium">
                  AI service not configured. Document analysis will be limited.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="contract">Contracts</option>
              <option value="agreement">Agreements</option>
              <option value="template">Templates</option>
              <option value="legal-brief">Legal Briefs</option>
              <option value="court-filing">Court Filings</option>
              <option value="other">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'type')}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt"
            />
            <motion.label
              htmlFor="file-upload"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </motion.label>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2">
                        {document.name}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {document.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {document.isNotarized && (
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full" title="Notarized">
                        <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <button 
                      onClick={() => toggleFavorite(document.id)}
                      className="text-neutral-400 hover:text-yellow-500 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${document.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Status and Type */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(document.status)}
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {getStatusText(document.status)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}>
                    {document.type.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Summary */}
                {document.summary && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
                      {document.summary}
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>{document.uploadDate.toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDocument(document);
                      setShowDocumentModal(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </motion.button>
                  
                  {document.status === 'pending' && isGeminiConfigured() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => analyzeDocumentContent(document.id)}
                      disabled={isAnalyzing}
                      className="px-3 py-2 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors disabled:opacity-50"
                    >
                      {isAnalyzing ? <Loader className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadDocument(document)}
                    className="px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Download PDF Report"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  
                  {!document.isNotarized && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => notarizeDocument(document.id)}
                      disabled={isNotarizing}
                      className="px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Notarize on blockchain"
                    >
                      {isNotarizing ? <Loader className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteDocument(document.id)}
                    className="px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload your first document to get started with AI-powered legal analysis.'
              }
            </p>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="empty-file-upload"
                accept=".pdf,.doc,.docx,.txt"
              />
              <motion.label
                htmlFor="empty-file-upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Document</span>
              </motion.label>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Upload Document
              </h3>
              
              {uploadingFile && (
                <div className="mb-4">
                  <div className="flex items-center space-x-3 p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                    <FileText className="w-8 h-8 text-primary-500" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {uploadingFile.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {(uploadingFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadingFile(null);
                  }}
                  className="flex-1 px-4 py-2 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processUpload}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document View Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {selectedDocument.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadDocument(selectedDocument)}
                    className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {selectedDocument.analysis && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Summary</h4>
                    <p className="text-neutral-600 dark:text-neutral-300">{selectedDocument.analysis.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Key Points</h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-300">
                      {selectedDocument.analysis.keyPoints.map((point: string, index: number) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Potential Risks</h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-300">
                      {selectedDocument.analysis.risks.map((risk: string, index: number) => (
                        <li key={index} className="text-warning-600 dark:text-warning-400">{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-300">
                      {selectedDocument.analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-success-600 dark:text-success-400">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {selectedDocument.content && (
                <div className="mt-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Document Content</h4>
                  <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                      {selectedDocument.content.substring(0, 1000)}
                      {selectedDocument.content.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}