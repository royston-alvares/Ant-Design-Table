import React, { useEffect, useState } from 'react';
import { Table, Pagination, Skeleton } from 'antd';
import axios from 'axios';

const renderNestedObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj; 
  }

  return Object.keys(obj).map((key) => {
    const value = obj[key];
    return (
      <div key={key}>
        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
        {typeof value === 'object' ? renderNestedObject(value) : value}
      </div>
    );
  });
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); 

  // Fetch data from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        setUsers(response.data);
        setLoading(false); 
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false); 
      }
    };

    fetchUsers();
  }, []);

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generateColumns = (data) => {
    if (data.length === 0) return [];

    const sampleUser = data[0]; 
    return Object.keys(sampleUser).map((key) => {
      if (typeof sampleUser[key] === 'object' && sampleUser[key] !== null) {
        return null; 
      }

      return {
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        sorter: (a, b) => (a[key] > b[key] ? 1 : -1), 
      };
    }).filter(Boolean); 
  };

  const paginationProps = {
    current: currentPage,
    pageSize: pageSize,
    total: users.length,
    onChange: handlePageChange,
  };

  const currentData = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Shimmer loading UI (Skeleton)
  const renderSkeleton = () => {
    return (
      <Skeleton
        active
        paragraph={{ rows: 5 }}
        title={false}
      />
    );
  };

  // Expandable rows
  const expandedRowRender = (record) => {
    const expandableData = {};

    Object.keys(record).forEach((key) => {
      const value = record[key];
      if (typeof value === 'object' && value !== null) {
        expandableData[key] = value;
      }
    });

    return (
      <div className="expanded-row-content">
        <div className="expanded-row-inner">
          {Object.keys(expandableData).map((section) => (
            <div key={section} className="expanded-row-item">
              <h4>{section.charAt(0).toUpperCase() + section.slice(1)}</h4>
              {renderNestedObject(expandableData[section])}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="table-container">
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          <Table
            columns={generateColumns(users)}
            dataSource={currentData}
            loading={loading}
            pagination={false} 
            rowKey="id"
            expandable={{
              expandedRowRender, 
              rowExpandable: (record) => true, 
            }}
            className="user-table"
          />
          <Pagination {...paginationProps} className="pagination" />
        </>
      )}
    </div>
  );
};

export default UserTable;
