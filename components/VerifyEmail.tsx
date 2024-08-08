// components/VerifyEmail.tsx
import { gql, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [verifyEmail] = useMutation(VERIFY_EMAIL);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail({ variables: { token: token as string } })
        .then(() => setMessage('Email verified successfully.'))
        .catch((error) => setMessage(`Error: ${error.message}`));
    }
  }, [token, verifyEmail]);

  return <div>{message}</div>;
}
