// frontend/src/components/__tests__/SearchBar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnChangeKeyword = jest.fn();
  const mockOnChangeSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input and button', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={false}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    expect(screen.getByPlaceholderText(/tìm quán theo tên hoặc địa chỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/tìm kiếm/i)).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={false}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    const input = screen.getByPlaceholderText(/tìm quán theo tên hoặc địa chỉ/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'coffee' } });
    fireEvent.submit(form);

    expect(mockOnSearch).toHaveBeenCalledWith('coffee');
  });

  it('should call onChangeKeyword when input changes', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={false}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    const input = screen.getByPlaceholderText(/tìm quán theo tên hoặc địa chỉ/i);
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnChangeKeyword).toHaveBeenCalledWith('test');
  });

  it('should call onChangeSort when sort select changes', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={false}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    const select = screen.getByDisplayValue(/đánh giá cao/i);
    fireEvent.change(select, { target: { value: 'distance' } });

    expect(mockOnChangeSort).toHaveBeenCalledWith('distance');
  });

  it('should disable button when loading', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={true}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    const button = screen.getByText(/đang tìm/i);
    expect(button).toBeDisabled();
  });

  it('should display correct sort options', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onChangeKeyword={mockOnChangeKeyword}
        loading={false}
        sort="rating"
        onChangeSort={mockOnChangeSort}
      />
    );

    expect(screen.getByText(/đánh giá cao/i)).toBeInTheDocument();
    expect(screen.getByText(/a–z theo tên/i)).toBeInTheDocument();
    expect(screen.getByText(/gần tôi/i)).toBeInTheDocument();
  });
});




