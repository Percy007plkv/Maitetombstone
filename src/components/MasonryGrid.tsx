import { ReactNode, useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: ReactNode[];
  columns?: {
    default: number;
    sm?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function MasonryGrid({
  children,
  columns = { default: 1, sm: 2, lg: 3, xl: 3 },
  gap = 16
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(columns.default);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280 && columns.xl) {
        setColumnCount(columns.xl);
      } else if (width >= 1024 && columns.lg) {
        setColumnCount(columns.lg);
      } else if (width >= 640 && columns.sm) {
        setColumnCount(columns.sm);
      } else {
        setColumnCount(columns.default);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  const columnWrappers: ReactNode[][] = Array.from({ length: columnCount }, () => []);

  children.forEach((child, index) => {
    const columnIndex = index % columnCount;
    columnWrappers[columnIndex].push(child);
  });

  return (
    <div ref={containerRef} className="flex" style={{ gap: `${gap}px` }}>
      {columnWrappers.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column}
        </div>
      ))}
    </div>
  );
}
