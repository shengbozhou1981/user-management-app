// pages/users/[id].tsx
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

const USER_QUERY = gql`
  query UserQuery($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

export default function User() {
  const router = useRouter();
  const { id } = router.query;
  const { loading, error, data } = useQuery(USER_QUERY, { variables: { id } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>Email: {data.user.email}</p>
    </div>
  );
}
