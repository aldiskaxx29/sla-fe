// React
import { useState } from "react";

// Hooks
import {
  useDownloadTemplateMutation,
  useImportTemplateMutation,
  useRekonsiliasiPeriod,
  useRekonsiliasiTable,
  useSaveRekonsiliasiMutation,
} from "@/app/hooks";

// Templates
import InputSiteTemplate from "@/app/components/templates/InputSiteTemplate";

// Organism
import RekonsiliasiFilterBar from "@/app/components/organism/forms/RekonsiliasiFilterBar";
import ImportTemplateModal from "@/app/components/organism/popup/ImportTemplateModal";
import RekonsiliasiEditModal from "@/app/components/organism/popup/RekonsiliasiEditModal";
import RekonsiliasiTable from "@/app/components/organism/tables/RekonsiliasiTable";

// Utils
import {
  buildRekonsiliasiFormData,
  type RekonsiliasiSavePayload,
} from "@/app/utils/rekonsiliasi.utils";

// Types
import type { RekonsiliasiRow } from "@/app/types/reconsiliation/rekonsiliasi.types";

/** Halaman rekonsiliasi site: filter periode, tabel data, edit, dan import Excel. */
const InputSitePage = () => {
  const period = useRekonsiliasiPeriod();
  const table = useRekonsiliasiTable({ period });

  const [editedRow, setEditedRow] = useState<RekonsiliasiRow | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const saveMutation = useSaveRekonsiliasiMutation();
  const importMutation = useImportTemplateMutation();
  const downloadMutation = useDownloadTemplateMutation();

  const handleDownloadTemplate = () => {
    downloadMutation.mutate({
      parameter: period.parameter,
      year: period.year,
      month: period.month,
      week: period.isMttrqParameter ? undefined : period.effectiveWeek,
      exclude: period.exclude,
      evidence: period.evidence,
    });
  };

  const handleImport = async (file: File) => {
    await importMutation.mutateAsync({
      file,
      parameter: period.parameter,
      month: period.month,
      week: period.isMttrqParameter ? undefined : period.week,
      exclude: period.exclude,
    });

    setIsImportOpen(false);
  };

  const handleSave = async (payload: RekonsiliasiSavePayload) => {
    await saveMutation.mutateAsync(
      buildRekonsiliasiFormData(payload, period.parameter),
    );

    setEditedRow(null);
  };

  return (
    <InputSiteTemplate
      toolbar={
        <RekonsiliasiFilterBar
          period={period}
          search={table.search}
          onSearchChange={table.handleSearchChange}
          onDownloadTemplate={handleDownloadTemplate}
          onImportClick={() => setIsImportOpen(true)}
          isDownloading={downloadMutation.isPending}
        />
      }
    >
      <RekonsiliasiTable
        rows={table.rows}
        isLoading={table.isLoading}
        parameter={period.parameter}
        week={period.effectiveWeek}
        pagination={table.pagination}
        columnFilters={table.columnFilters}
        columnSearch={table.columnSearch}
        filterOptions={table.filterOptions}
        onFilterChange={table.handleFilterChange}
        onSearchChange={table.handleColumnSearchChange}
        onPageChange={table.handlePageChange}
        onEdit={setEditedRow}
      />

      <RekonsiliasiEditModal
        open={Boolean(editedRow)}
        parameter={period.parameter}
        dataModal={
          editedRow ? { ...editedRow, parameter: period.parameter } : {}
        }
        week={period.effectiveWeek}
        year={period.year}
        onCancel={() => setEditedRow(null)}
        onSave={handleSave}
        isLoading={saveMutation.isPending}
      />

      <ImportTemplateModal
        open={isImportOpen}
        onCancel={() => setIsImportOpen(false)}
        onConfirm={handleImport}
        isLoading={importMutation.isPending}
        parameter={period.parameter}
        month={period.month}
        week={period.effectiveWeek}
        year={period.year}
        prev={period.prev}
        exclude={period.exclude}
        evidence={period.evidence}
        isMttrqParameter={period.isMttrqParameter}
      />
    </InputSiteTemplate>
  );
};

export default InputSitePage;
