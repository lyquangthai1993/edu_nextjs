type PostStatus = 'draft' | 'published' | 'archived';

type StatusColors = {
  background: string;
  text: string;
};

export function getStatusColors(status?: PostStatus | null): StatusColors {
  if (!status) {
    return {
      background: 'bg-gray-100',
      text: 'text-gray-800',
    };
  }

  switch (status) {
    case 'draft':
      return {
        background: 'bg-yellow-100',
        text: 'text-yellow-800',
      };
    case 'published':
      return {
        background: 'bg-green-100',
        text: 'text-green-800',
      };
    case 'archived':
      return {
        background: 'bg-gray-100',
        text: 'text-gray-800',
      };
    default:
      return {
        background: 'bg-gray-100',
        text: 'text-gray-800',
      };
  }
}

export function formatStatus(status?: PostStatus | null): string {
  if (!status) {
    return 'Unknown';
  }

  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    default:
      return 'Unknown';
  }
}
