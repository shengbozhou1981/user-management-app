// components/RequestPasswordReset.tsx
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';

const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [requestPasswordReset] = useMutation(REQUEST_PASSWORD_RESET);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestPasswordReset({ variables: { email } });
    setMessage('A password reset link has been sent to your email.');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Request Password Reset</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
