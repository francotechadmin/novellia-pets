import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import type { MedicalRecord, VaccineData, AllergyData } from '@/lib/db/schema'

interface RecordsListProps {
  records: MedicalRecord[]
}

export function RecordsList({ records }: RecordsListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No medical records yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {record.recordType === 'vaccine' && (
                  <VaccineRecord data={record.data as VaccineData} />
                )}
                {record.recordType === 'allergy' && (
                  <AllergyRecord data={record.data as AllergyData} />
                )}
              </div>
              <Badge
                variant={record.recordType === 'vaccine' ? 'default' : 'destructive'}
                className="ml-4"
              >
                {record.recordType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Added on {formatDate(record.createdAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function VaccineRecord({ data }: { data: VaccineData }) {
  return (
    <div>
      <h3 className="font-semibold text-lg">{data.vaccineName}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Administered: {formatDate(data.administeredDate)}
      </p>
    </div>
  )
}

function AllergyRecord({ data }: { data: AllergyData }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">{data.allergyName}</h3>
        <Badge variant={data.severity === 'severe' ? 'destructive' : 'secondary'}>
          {data.severity}
        </Badge>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium mb-1">Reactions:</p>
        <div className="flex flex-wrap gap-1">
          {data.reactions.map((reaction) => (
            <span
              key={reaction}
              className="inline-block px-2 py-1 text-xs bg-secondary rounded-md"
            >
              {reaction}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
