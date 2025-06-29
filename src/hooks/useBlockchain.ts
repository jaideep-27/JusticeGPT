import { useState, useCallback } from 'react';
import { 
  notarizeDocument, 
  verifyDocumentNotarization, 
  generateDocumentHash,
  createAlgorandAccount,
  generateVerificationQR
} from '../lib/algorand';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface NotarizedDocument {
  id: string;
  name: string;
  hash: string;
  transactionId: string;
  blockNumber: number;
  timestamp: number;
  verified: boolean;
  qrCode: string;
}

export const useBlockchain = () => {
  const [isNotarizing, setIsNotarizing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();

  const notarize = useCallback(async (
    documentContent: string,
    documentName: string,
    metadata: any = {}
  ): Promise<NotarizedDocument> => {
    if (!user) {
      throw new Error('User must be logged in to notarize documents');
    }

    setIsNotarizing(true);
    try {
      // For demo purposes, create a temporary account
      // In production, users would have persistent Algorand accounts
      const account = createAlgorandAccount();
      
      const notarizationMetadata = {
        ...metadata,
        documentName,
        userId: user.id,
        userEmail: user.email,
        platform: 'JusticeGPT',
        jurisdiction: user.jurisdiction
      };

      const result = await notarizeDocument(
        documentContent,
        notarizationMetadata,
        account.address,
        account.privateKey
      );

      if (!result.success) {
        throw new Error(result.error || 'Notarization failed');
      }

      const qrData = generateVerificationQR(result.transactionId!, result.documentHash);
      
      const notarizedDoc: NotarizedDocument = {
        id: `${user.id}_${Date.now()}`,
        name: documentName,
        hash: result.documentHash,
        transactionId: result.transactionId!,
        blockNumber: result.blockNumber!,
        timestamp: result.timestamp,
        verified: true,
        qrCode: qrData
      };

      toast.success('Document successfully notarized on blockchain!');
      return notarizedDoc;

    } catch (error) {
      console.error('Notarization error:', error);
      toast.error('Failed to notarize document');
      throw error;
    } finally {
      setIsNotarizing(false);
    }
  }, [user]);

  const verify = useCallback(async (
    transactionId: string,
    expectedHash: string
  ): Promise<{ verified: boolean; details?: any; error?: string }> => {
    setIsVerifying(true);
    try {
      const result = await verifyDocumentNotarization(transactionId, expectedHash);
      
      if (result.verified) {
        toast.success('Document verification successful!');
      } else {
        toast.error('Document verification failed');
      }

      return result;
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify document');
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const generateHash = useCallback((content: string, metadata: any = {}): string => {
    return generateDocumentHash(content, metadata);
  }, []);

  const createAccount = useCallback(() => {
    try {
      const account = createAlgorandAccount();
      toast.success('Algorand account created successfully!');
      return account;
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error('Failed to create Algorand account');
      throw error;
    }
  }, []);

  return {
    notarize,
    verify,
    generateHash,
    createAccount,
    isNotarizing,
    isVerifying
  };
};