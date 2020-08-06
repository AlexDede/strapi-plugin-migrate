/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { Button, Textarea } from '@buffetjs/core';
import { request } from 'strapi-helper-plugin';

import Row from '../layout/Row';
import EditRoleIdsModal from './EditRoleIdsModal';

const ExportPermissions = ({ currentRoles, setCurrentRoles }) => {
  console.log('ExportPermissions -> currentRoles', currentRoles);
  const [retrievedPostgresString, setRetrievedPostgresString] = useState('');

  const [loadingRetrieve, setLoadingRetrieve] = useState(false);

  const [errorRetrieve, setErrorRetrieve] = useState(null);

  const [copySuccess, setCopySuccess] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);

  const handleRetrieve = async () => {
    setErrorRetrieve(false);
    setLoadingRetrieve(true);

    try {
      const response = await request('/migrate/retrieveSqlString', {
        method: 'POST',
        body: { updatedRoles: currentRoles, type: 'postgres' },
      });

      if (response) {
        const cleanedString = response.generatedString.replace(/\\\//g, '/');

        setRetrievedPostgresString(`${cleanedString};`);
        setLoadingRetrieve(false);
      }
    } catch (e) {
      console.log('Error: ', e);
      setErrorRetrieve(true);
      setLoadingRetrieve(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(retrievedPostgresString);
    setCopySuccess(true);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div>
      <h1 style={{ marginTop: '3rem' }}>Export Permissions</h1>
      <div>
        You will get a raw SQL query that you will be able to paste in another
        environment (for example staging, production).
      </div>
      <EditRoleIdsModal
        isOpen={isModalOpen}
        setOpen={setModalOpen}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
        currentRoles={currentRoles}
        setCurrentRoles={setCurrentRoles}
      />
      <Row>
        <Button
          disabled={loadingRetrieve}
          isLoading={loadingRetrieve}
          label="Get now"
          onClick={handleRetrieve}
          style={{ marginRight: 10 }}
        />
        {retrievedPostgresString && (
          <Button
            color={copySuccess ? 'success' : 'primary'}
            label={copySuccess ? 'Copied!' : 'Copy Permissions query'}
            onClick={handleCopy}
          />
        )}
      </Row>
      <Row>
        <Textarea
          name="export-sql-string"
          value={retrievedPostgresString}
          readOnly
        />
      </Row>
      {!errorRetrieve && retrievedPostgresString && !loadingRetrieve && (
        <Row>
          <div style={{ color: '#28a745' }}>User permissions retrieved.</div>
        </Row>
      )}
      {errorRetrieve && (
        <Row>
          <div style={{ color: '#dc3545' }}>Uh-oh! Something went wrong.</div>
        </Row>
      )}
    </div>
  );
};

export default ExportPermissions;