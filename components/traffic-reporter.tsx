"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Droplets, Car, MapPin, Clock, Star, ThumbsUp, ThumbsDown } from "lucide-react"

interface TrafficReport {
  id: string
  type: "flood" | "traffic"
  location: string
  reporter: string
  timestamp: string
  verified: boolean
  votes: number
  description: string
}

interface TrafficReporterProps {
  userScore: number
  setUserScore: (score: number) => void
}

export default function TrafficReporter({ userScore, setUserScore }: TrafficReporterProps) {
  const [reports, setReports] = useState<TrafficReport[]>([
    {
      id: "1",
      type: "flood",
      location: "Đường Nguyễn Văn Linh, Quận 7",
      reporter: "Tài xế A",
      timestamp: "10 phút trước",
      verified: true,
      votes: 5,
      description: "Ngập nước sâu khoảng 30cm, xe máy khó di chuyển",
    },
    {
      id: "2",
      type: "traffic",
      location: "Cầu Sài Gòn, hướng Quận 1",
      reporter: "Tài xế B",
      timestamp: "15 phút trước",
      verified: true,
      votes: 8,
      description: "Kẹt xe nghiêm trọng do tai nạn giao thông",
    },
    {
      id: "3",
      type: "flood",
      location: "Đường Võ Văn Kiệt, Quận 5",
      reporter: "Tài xế C",
      timestamp: "25 phút trước",
      verified: false,
      votes: 2,
      description: "Ngập nước nhẹ sau cơn mưa",
    },
  ])

  const [showReportForm, setShowReportForm] = useState(false)
  const [reportType, setReportType] = useState<"flood" | "traffic" | null>(null)

  const submitReport = (type: "flood" | "traffic") => {
    const newReport: TrafficReport = {
      id: Date.now().toString(),
      type,
      location: "Vị trí hiện tại của bạn",
      reporter: "Bạn",
      timestamp: "Vừa xong",
      verified: false,
      votes: 0,
      description: type === "flood" ? "Báo cáo ngập nước" : "Báo cáo kẹt xe",
    }

    setReports([newReport, ...reports])
    setUserScore(userScore + 10) // Award points for reporting
    setShowReportForm(false)
    setReportType(null)

    alert(`Đã gửi báo cáo ${type === "flood" ? "ngập nước" : "kẹt xe"}! +10 điểm`)
  }

  const voteReport = (reportId: string, isUpvote: boolean) => {
    setReports(
      reports.map((report) => {
        if (report.id === reportId) {
          return {
            ...report,
            votes: report.votes + (isUpvote ? 1 : -1),
          }
        }
        return report
      }),
    )

    if (isUpvote) {
      setUserScore(userScore + 2) // Award points for helpful voting
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo giao thông</h2>
          <p className="text-gray-600">Cảnh báo kẹt xe và ngập nước cho cộng đồng tài xế</p>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{userScore} điểm</span>
        </div>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Báo cáo tình huống</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showReportForm ? (
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowReportForm(true)}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
              >
                <Droplets className="h-4 w-4" />
                <span>Báo cáo ngập nước</span>
              </Button>
              <Button
                onClick={() => setShowReportForm(true)}
                variant="outline"
                className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <Car className="h-4 w-4" />
                <span>Báo cáo kẹt xe</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Chọn loại tình huống bạn muốn báo cáo:</p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => submitReport("flood")}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Droplets className="h-4 w-4" />
                  <span>Ngập nước</span>
                </Button>
                <Button
                  onClick={() => submitReport("traffic")}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600"
                >
                  <Car className="h-4 w-4" />
                  <span>Kẹt xe</span>
                </Button>
                <Button onClick={() => setShowReportForm(false)} variant="outline">
                  Hủy
                </Button>
              </div>
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                <strong>Lưu ý:</strong> Báo cáo đúng sự thật sẽ được thưởng điểm. Báo cáo sai sẽ bị trừ điểm.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Báo cáo gần đây ({reports.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {report.type === "flood" ? (
                        <Droplets className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Car className="h-4 w-4 text-red-500" />
                      )}
                      <Badge
                        variant={report.type === "flood" ? "default" : "destructive"}
                        className={report.type === "flood" ? "bg-blue-500" : "bg-red-500"}
                      >
                        {report.type === "flood" ? "Ngập nước" : "Kẹt xe"}
                      </Badge>
                      {report.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Đã xác thực
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="font-medium">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">
                          {report.timestamp} - Báo cáo bởi {report.reporter}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{report.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => voteReport(report.id, true)}
                      className="flex items-center space-x-1"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{report.votes}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => voteReport(report.id, false)}
                      className="flex items-center space-x-1"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">Hệ thống điểm thưởng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">+10 điểm</div>
              <div className="text-gray-600">Báo cáo tình huống</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">+5 điểm</div>
              <div className="text-gray-600">Báo cáo được xác thực</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">-20 điểm</div>
              <div className="text-gray-600">Báo cáo sai sự thật</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
