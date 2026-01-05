// frontend/src/components/__tests__/FilterBar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../FilterBar';

describe('FilterBar Component', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all filter options', () => {
    render(
      <FilterBar
        filters={{ minRating: null, maxDistance: null, isOpen: null }}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText(/đánh giá tối thiểu/i)).toBeInTheDocument();
    expect(screen.getByText(/khoảng cách tối đa/i)).toBeInTheDocument();
    expect(screen.getByText(/trạng thái/i)).toBeInTheDocument();
  });

  it('should call onFilterChange when rating filter changes', () => {
    render(
      <FilterBar
        filters={{ minRating: null, maxDistance: null, isOpen: null }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const ratingSelects = screen.getAllByRole('combobox');
    const ratingSelect = ratingSelects[0]; // First select is rating
    fireEvent.change(ratingSelect, { target: { value: '4.0' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      minRating: '4.0',
      maxDistance: null,
      isOpen: null
    });
  });

  it('should call onFilterChange when distance filter changes', () => {
    render(
      <FilterBar
        filters={{ minRating: null, maxDistance: null, isOpen: null }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const distanceSelects = screen.getAllByRole('combobox');
    const distanceSelect = distanceSelects[1]; // Second select is distance
    fireEvent.change(distanceSelect, { target: { value: '2' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      minRating: null,
      maxDistance: '2',
      isOpen: null
    });
  });

  it('should show clear button when filters are active', () => {
    render(
      <FilterBar
        filters={{ minRating: '4.0', maxDistance: null, isOpen: null }}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText(/xóa bộ lọc/i)).toBeInTheDocument();
  });

  it('should not show clear button when no filters are active', () => {
    render(
      <FilterBar
        filters={{ minRating: null, maxDistance: null, isOpen: null }}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.queryByText(/xóa bộ lọc/i)).not.toBeInTheDocument();
  });

  it('should clear filters when clear button is clicked', () => {
    render(
      <FilterBar
        filters={{ minRating: '4.0', maxDistance: '2', isOpen: true }}
        onFilterChange={mockOnFilterChange}
      />
    );

    const clearButton = screen.getByText(/xóa bộ lọc/i);
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      minRating: null,
      maxDistance: null,
      isOpen: null
    });
  });
});

