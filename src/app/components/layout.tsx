"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Home, Star, User } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"

interface LayoutProps {
  children: React.ReactNode
  currentPath: string
}

export default function Layout({ children, currentPath }: LayoutProps) {
  const { scrollY } = useScroll()
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY ? "down" : "up"
    if (direction === "down" && latest > 50) {
      setIsHeaderVisible(false)
    } else if (direction === "up") {
      setIsHeaderVisible(true)
    }
    setLastScrollY(latest)
  })

  const menuItems = [
    { path: "/", label: "さがす", icon: Home },
    { path: "/favorites", label: "ココいく", icon: Star },
    { path: "/profile", label: "プロフィール", icon: User },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <motion.header
        className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50"
        initial={{ y: 0 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-center px-4 h-16">
          <h1 className="text-2xl font-bold text-[#FFD700] tracking-wide">ココいく</h1>
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      <main className="pt-16 pb-20 min-h-screen">{children}</main>

      {/* フッターナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-50">
        <div className="flex items-center justify-around h-16 px-6 max-w-md mx-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path
            return (
              <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-20">
                <div
                  className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                    isActive ? "text-[#FFD700]" : "text-[#808080]"
                  }`}
                >
                  <Icon size={24} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 w-12 h-0.5 bg-[#FFD700]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

