import { useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';

import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/GoldApp.css';

const MAX_UINT64 = 2n ** 64n - 1n;

type ActionStatus = 'idle' | 'pending' | 'success' | 'error';

function formatHandle(handle?: string | readonly string[] | bigint) {
  if (!handle) {
    return '—';
  }

  const value = typeof handle === 'string' ? handle : Array.isArray(handle) ? handle[0] : handle.toString();
  if (!value || value === '0x' || value === '0x0') {
    return '0x0';
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

export function ConfidentialGoldApp() {
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading } = useZamaInstance();

  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [mintStatus, setMintStatus] = useState<ActionStatus>('idle');
  const [burnStatus, setBurnStatus] = useState<ActionStatus>('idle');
  const [mintMessage, setMintMessage] = useState('');
  const [burnMessage, setBurnMessage] = useState('');
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  const {
    data: encryptedBalance,
    refetch: refetchBalance,
    isFetching: refreshingBalance,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'confidentialBalanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: encryptedSupply, refetch: refetchSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'confidentialTotalSupply',
    query: {
      enabled: true,
    },
  });

  const normalizedBalanceHandle = useMemo(() => {
    if (!encryptedBalance) {
      return undefined;
    }

    if (typeof encryptedBalance === 'string') {
      return encryptedBalance;
    }

    if (Array.isArray(encryptedBalance)) {
      const [first] = encryptedBalance as string[];
      return first;
    }

    return undefined;
  }, [encryptedBalance]);

  async function encryptAmount(value: bigint) {
    if (!instance) {
      throw new Error('Encryption service is unavailable.');
    }

    if (!address) {
      throw new Error('Connect a wallet to encrypt values.');
    }

    const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
    buffer.add64(value);
    const encrypted = await buffer.encrypt();

    const handle = encrypted?.handles?.[0];
    if (typeof handle !== 'string') {
      throw new Error('Failed to encrypt amount.');
    }

    return {
      handle,
      proof: encrypted.inputProof as string,
    };
  }

  async function handleMint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMintStatus('idle');
    setMintMessage('');

    if (!isConnected || !address) {
      setMintStatus('error');
      setMintMessage('Connect a wallet to mint cGOLD.');
      return;
    }

    const trimmed = mintAmount.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setMintStatus('error');
      setMintMessage('Enter a whole number of grams to mint.');
      return;
    }

    const value = BigInt(trimmed);
    if (value === 0n) {
      setMintStatus('error');
      setMintMessage('Mint amount must be greater than zero.');
      return;
    }

    if (value > MAX_UINT64) {
      setMintStatus('error');
      setMintMessage('Amount exceeds uint64 range.');
      return;
    }

    if (!instance) {
      setMintStatus('error');
      setMintMessage('Encryption service is not ready. Please try again shortly.');
      return;
    }

    try {
      setMintStatus('pending');
      setMintMessage('Encrypting amount…');
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable.');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const encrypted = await encryptAmount(value);
      setMintMessage('Submitting mint transaction…');
      const tx = await contract.mint(address, encrypted.handle, encrypted.proof);
      setMintMessage('Waiting for confirmation…');
      await tx.wait();

      setMintStatus('success');
      setMintMessage(`Minted ${value.toString()} cGOLD successfully.`);
      setMintAmount('');
      setDecryptedBalance(null);
      await Promise.allSettled([refetchBalance(), refetchSupply()]);
    } catch (error) {
      console.error('Mint failed:', error);
      setMintStatus('error');
      setMintMessage(
        error instanceof Error ? error.message : 'Mint transaction failed. Please try again.',
      );
    }
  }

  async function handleBurn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBurnStatus('idle');
    setBurnMessage('');

    if (!isConnected || !address) {
      setBurnStatus('error');
      setBurnMessage('Connect a wallet to redeem cGOLD.');
      return;
    }

    const trimmed = burnAmount.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setBurnStatus('error');
      setBurnMessage('Enter a whole number of grams to redeem.');
      return;
    }

    const value = BigInt(trimmed);
    if (value === 0n) {
      setBurnStatus('error');
      setBurnMessage('Redeem amount must be greater than zero.');
      return;
    }

    if (value > MAX_UINT64) {
      setBurnStatus('error');
      setBurnMessage('Amount exceeds uint64 range.');
      return;
    }

    if (!instance) {
      setBurnStatus('error');
      setBurnMessage('Encryption service is not ready. Please try again shortly.');
      return;
    }

    try {
      setBurnStatus('pending');
      setBurnMessage('Encrypting amount…');
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable.');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const encrypted = await encryptAmount(value);
      setBurnMessage('Submitting redemption transaction…');
      const tx = await contract.burn(address, encrypted.handle, encrypted.proof);
      setBurnMessage('Waiting for confirmation…');
      await tx.wait();

      setBurnStatus('success');
      setBurnMessage(`Redeemed ${value.toString()} cGOLD for physical gold.`);
      setBurnAmount('');
      setDecryptedBalance(null);
      await Promise.allSettled([refetchBalance(), refetchSupply()]);
    } catch (error) {
      console.error('Redeem failed:', error);
      setBurnStatus('error');
      setBurnMessage(
        error instanceof Error ? error.message : 'Redemption transaction failed. Please try again.',
      );
    }
  }

  async function decryptBalance() {
    setDecryptionError(null);
    setDecryptedBalance(null);

    if (!isConnected || !address) {
      setDecryptionError('Connect your wallet to decrypt your cGOLD balance.');
      return;
    }

    if (!instance) {
      setDecryptionError('Encryption service is still loading. Please try again in a moment.');
      return;
    }

    if (!normalizedBalanceHandle || normalizedBalanceHandle === '0x') {
      setDecryptedBalance('0');
      return;
    }

    try {
      setDecrypting(true);
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable.');
      }

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contracts = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contracts,
        startTimestamp,
        durationDays,
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        [{ handle: normalizedBalanceHandle, contractAddress: CONTRACT_ADDRESS }],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contracts,
        address,
        startTimestamp,
        durationDays,
      );

      const decryptedValue = result?.[normalizedBalanceHandle];
      if (decryptedValue === undefined) {
        throw new Error('Unable to decrypt balance.');
      }

      setDecryptedBalance(decryptedValue.toString());
    } catch (error) {
      console.error('Decryption failed:', error);
      setDecryptionError(error instanceof Error ? error.message : 'Failed to decrypt balance.');
    } finally {
      setDecrypting(false);
    }
  }

  return (
    <div className="gold-app">
      <section className="app-hero">
        <h1 className="hero-title">Confidential Gold Vault</h1>
        <p className="hero-subtitle">
          Deposit physical gold to mint private cGOLD, and redeem cGOLD back to bullion whenever you need.
          Zama FHE keeps every balance encrypted, so only you decide when to reveal your holdings.
        </p>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-label">Your Encrypted Balance</span>
            <span className="stat-value">{formatHandle(normalizedBalanceHandle)}</span>
            {refreshingBalance ? <span className="stat-hint">Refreshing…</span> : null}
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Encrypted Supply</span>
            <span className="stat-value">{formatHandle(encryptedSupply as string)}</span>
          </div>
        </div>
      </section>

      <section className="action-grid">
        <div className="action-card">
          <h2 className="card-title">Mint cGOLD</h2>
          <p className="card-description">
            For every gram of gold you store with us, we mint exactly 1 cGOLD to your wallet.
          </p>
          <form className="action-form" onSubmit={handleMint}>
            <label className="form-label" htmlFor="mint-amount">
              Amount (grams)
            </label>
            <input
              id="mint-amount"
              className="form-input"
              placeholder="Enter grams of physical gold"
              value={mintAmount}
              onChange={(event) => setMintAmount(event.target.value)}
              inputMode="numeric"
              pattern="\\d*"
              disabled={!isConnected || mintStatus === 'pending' || zamaLoading || !instance}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={!isConnected || mintStatus === 'pending' || zamaLoading || !instance}
            >
              {mintStatus === 'pending' ? 'Minting…' : 'Mint cGOLD'}
            </button>
            {mintMessage && (
              <p className={`status-message status-${mintStatus}`}>{mintMessage}</p>
            )}
          </form>
        </div>

        <div className="action-card">
          <h2 className="card-title">Redeem for Gold</h2>
          <p className="card-description">
            Burn your confidential balance to withdraw the same weight in real gold from our vault.
          </p>
          <form className="action-form" onSubmit={handleBurn}>
            <label className="form-label" htmlFor="burn-amount">
              Amount (grams)
            </label>
            <input
              id="burn-amount"
              className="form-input"
              placeholder="Enter grams to redeem"
              value={burnAmount}
              onChange={(event) => setBurnAmount(event.target.value)}
              inputMode="numeric"
              pattern="\\d*"
              disabled={!isConnected || burnStatus === 'pending' || zamaLoading || !instance}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={!isConnected || burnStatus === 'pending' || zamaLoading || !instance}
            >
              {burnStatus === 'pending' ? 'Redeeming…' : 'Redeem to Gold'}
            </button>
            {burnMessage && (
              <p className={`status-message status-${burnStatus}`}>{burnMessage}</p>
            )}
          </form>
        </div>

        <div className="action-card">
          <h2 className="card-title">Decrypt Your Balance</h2>
          <p className="card-description">
            Only you can reveal your holdings. Use Zama&apos;s relayer to decrypt your cGOLD amount locally.
          </p>
          <div className="decrypt-panel">
            <button
              type="button"
              className="secondary-button"
              onClick={decryptBalance}
              disabled={decrypting || !isConnected || zamaLoading}
            >
              {decrypting ? 'Decrypting…' : 'Decrypt cGOLD balance'}
            </button>
            {decryptedBalance !== null && (
              <p className="decrypted-value">
                You currently hold <strong>{decryptedBalance}</strong> cGOLD.
              </p>
            )}
            {decryptionError && (
              <p className="status-message status-error">{decryptionError}</p>
            )}
            {zamaLoading && (
              <p className="status-message status-info">Initializing Zama relayer…</p>
            )}
            {!isConnected && (
              <p className="status-message status-info">Connect your wallet to decrypt balances.</p>
            )}
          </div>
        </div>
      </section>

      <section className="privacy-panel">
        <h3 className="privacy-title">Why cGOLD stays private</h3>
        <ul className="privacy-list">
          <li>Balances and transfers are encrypted with Zama FHE, so observers only see ciphertexts.</li>
          <li>Minting and redemption require explicit approval, keeping the vault&rsquo;s backing 1:1 with your deposits.</li>
          <li>You can decrypt your own balance locally at any time—no one else gains visibility.</li>
        </ul>
      </section>
    </div>
  );
}
