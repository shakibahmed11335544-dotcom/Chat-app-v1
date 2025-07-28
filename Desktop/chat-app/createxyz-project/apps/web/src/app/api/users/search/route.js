import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return Response.json([]);
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users by name or email
    const users = await sql`
      SELECT 
        id,
        name,
        email,
        avatar_url,
        status,
        last_seen,
        created_at
      FROM users 
      WHERE 
        LOWER(name) LIKE ${'%' + searchTerm + '%'} OR
        LOWER(email) LIKE ${'%' + searchTerm + '%'}
      ORDER BY 
        CASE 
          WHEN LOWER(name) LIKE ${searchTerm + '%'} THEN 1
          WHEN LOWER(email) LIKE ${searchTerm + '%'} THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 20
    `;

    return Response.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return Response.json({ error: 'Failed to search users' }, { status: 500 });
  }
}