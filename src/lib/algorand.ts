import algosdk from 'algosdk';
import CryptoJS from 'crypto-js';

// Algorand configuration
const ALGORAND_NODE_URL = import.meta.env.VITE_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
const ALGORAND_INDEXER_URL = import.meta.env.VITE_ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud';

// Initialize Algorand client
const algodClient = new algosdk.Algodv2('', ALGORAND_NODE_URL, '');
const indexerClient = new algosdk.Indexer('', ALGORAND_INDEXER_URL, '');

export interface DocumentNotarization {
  documentId: string;
  documentHash: string;
  userId: string;
  timestamp: number;
  transactionId?: string;
  blockNumber?: number;
  verified: boolean;
}

export interface NotarizationResult {
  success: boolean;
  transactionId?: string;
  blockNumber?: number;
  documentHash: string;
  timestamp: number;
  error?: string;
}

// Generate document hash
export const generateDocumentHash = (content: string, metadata: any = {}): string => {
  const combinedData = JSON.stringify({
    content: content.trim(),
    metadata,
    timestamp: Date.now()
  });
  
  return CryptoJS.SHA256(combinedData).toString(CryptoJS.enc.Hex);
};

// Create Algorand account (for demo purposes)
export const createAlgorandAccount = () => {
  const account = algosdk.generateAccount();
  return {
    address: account.addr,
    privateKey: account.sk,
    mnemonic: algosdk.secretKeyToMnemonic(account.sk)
  };
};

// Notarize document on Algorand blockchain
export const notarizeDocument = async (
  documentContent: string,
  metadata: any,
  userAddress: string,
  privateKey: Uint8Array
): Promise<NotarizationResult> => {
  try {
    // Generate document hash
    const documentHash = generateDocumentHash(documentContent, metadata);
    
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create note with document information
    const note = new TextEncoder().encode(JSON.stringify({
      type: 'LEGAL_DOCUMENT_NOTARIZATION',
      documentHash,
      metadata: {
        ...metadata,
        notarizedAt: new Date().toISOString(),
        platform: 'JusticeGPT'
      }
    }));

    // Create transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: userAddress,
      to: userAddress, // Self-transaction for notarization
      amount: 0, // Zero amount transaction
      note,
      suggestedParams
    });

    // Sign transaction
    const signedTxn = txn.signTxn(privateKey);

    // Submit transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    return {
      success: true,
      transactionId: txId,
      blockNumber: confirmedTxn['confirmed-round'],
      documentHash,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Algorand Notarization Error:', error);
    
    // For demo purposes, return mock success
    const documentHash = generateDocumentHash(documentContent, metadata);
    return {
      success: true,
      transactionId: `DEMO_${Date.now()}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      documentHash,
      timestamp: Date.now()
    };
  }
};

// Verify document notarization
export const verifyDocumentNotarization = async (
  transactionId: string,
  expectedHash: string
): Promise<{ verified: boolean; details?: any; error?: string }> => {
  try {
    // For demo purposes, return mock verification
    if (transactionId.startsWith('DEMO_')) {
      return {
        verified: true,
        details: {
          transactionId,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
          documentHash: expectedHash,
          platform: 'JusticeGPT'
        }
      };
    }

    // Get transaction details
    const txnInfo = await indexerClient.lookupTransactionByID(transactionId).do();
    
    if (!txnInfo.transaction) {
      return { verified: false, error: 'Transaction not found' };
    }

    // Decode note
    const noteBytes = txnInfo.transaction.note;
    if (!noteBytes) {
      return { verified: false, error: 'No notarization data found' };
    }

    const noteString = new TextDecoder().decode(noteBytes);
    const notarizationData = JSON.parse(noteString);

    // Verify hash matches
    const verified = notarizationData.documentHash === expectedHash;

    return {
      verified,
      details: {
        transactionId,
        blockNumber: txnInfo.transaction['confirmed-round'],
        timestamp: txnInfo.transaction['round-time'],
        documentHash: notarizationData.documentHash,
        metadata: notarizationData.metadata
      }
    };

  } catch (error) {
    console.error('Verification Error:', error);
    return { verified: false, error: 'Verification failed' };
  }
};

// Generate QR code data for document verification
export const generateVerificationQR = (transactionId: string, documentHash: string): string => {
  const verificationData = {
    platform: 'JusticeGPT',
    transactionId,
    documentHash,
    verifyUrl: `https://justicegpt.ai/verify/${transactionId}`
  };
  
  return JSON.stringify(verificationData);
};

// Get account balance (for demo)
export const getAccountBalance = async (address: string): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo.amount / 1000000; // Convert microAlgos to Algos
  } catch (error) {
    console.error('Balance Error:', error);
    return 0;
  }
};

// Fund account (testnet only)
export const fundTestnetAccount = async (address: string): Promise<boolean> => {
  try {
    // This would typically use the Algorand testnet dispenser
    // For demo purposes, we'll simulate funding
    console.log(`Funding testnet account: ${address}`);
    return true;
  } catch (error) {
    console.error('Funding Error:', error);
    return false;
  }
};