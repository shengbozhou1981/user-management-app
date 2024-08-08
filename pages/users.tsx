// pages/users.tsx
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

const USERS_QUERY = gql`
  query UsersQuery {
    users {
      id
      name
      email
    }
  }
`;

export default function Users() {
  const { loading, error, data } = useQuery(USERS_QUERY);
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data.users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email} - {user.password}
            <button onClick={() => router.push(`/users/${user.id}`)}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
