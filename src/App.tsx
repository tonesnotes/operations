import { invoke } from '@tauri-apps/api/core';
import React, { useState, useEffect } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';

interface ProvenTx {
  provenTxId: number;
  txid: string;
  height: number;
  index: number;
  merklePath: string; // Base64 encoded in frontend
  rawTx: string;      // Base64 encoded in frontend
  blockHash: string;
  merkleRoot: string;
  createdAt: string;
  updatedAt: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<ProvenTx[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Invoke the Rust command
        const result: ProvenTx[] = await invoke('get_proven_txs');
        setData(result);
      } catch (err) {
        setError('Failed to fetch data: ' + err);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const txidOnWoC = (txid: string) => {
    console.log(`clicked ${txid}`)
    const url = `https://whatsonchain.com/tx/${txid}`;
    console.log(`url ${url}`)
    openUrl(url)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Proven Transactions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>TXID</th>
            <th>Height</th>
            <th>Index</th>
            <th>Block Hash</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx) => (
            <tr key={tx.provenTxId}>
              <td>{tx.provenTxId}</td>
              <td onClick={() => txidOnWoC(tx.txid)}
                style={{
                  cursor: 'pointer',
                  color: 'blue',
                  textDecoration: 'underline',
                }}
                >{tx.txid}</td>
              <td>{tx.height}</td>
              <td>{tx.index}</td>
              <td>{tx.blockHash}</td>
              <td>{tx.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;