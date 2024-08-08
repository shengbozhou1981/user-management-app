// components/UpdateUserForm.tsx
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_USER_MUTATION, GET_USER_QUERY } from '../graphql/queries'; // Assume GET_USER_QUERY is defined in queries.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UpdateUserForm() {
  const router = useRouter();
  const userId = router.query.id as string;
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { id: userId },
    skip: !userId,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    if (data && data.user) {
      setName(data.user.name);
      setEmail(data.user.email);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required');
      return;
    }

    try {
      await updateUser({ variables: { id: userId, name, email } });
      router.push('/users');
    } catch (err) {
      console.error('Update error:', err);
      alert('Update failed. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update'}
      </button>
      {error && <p style={{ color: 'red' }}>Update failed. Please try again.</p>}
    </form>
  );
}
