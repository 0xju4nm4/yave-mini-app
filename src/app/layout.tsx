"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { App, ConfigProvider, Layout } from "antd";
import "antd/dist/reset.css";
import "../styles/globals.css";
import styles from "./landing.module.css";

const { Content } = Layout;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#00d4ff",
                colorPrimaryHover: "#00e6ff",
                colorPrimaryActive: "#00b8e6",
                colorBgContainer: "#0a0a0f",
                colorBgElevated: "#0f0f1a",
                colorText: "#ffffff",
                colorTextHeading: "#ffffff",
                colorTextSecondary: "rgba(255, 255, 255, 0.7)",
                colorBorder: "rgba(0, 212, 255, 0.2)",
                colorBorderSecondary: "rgba(0, 212, 255, 0.1)",
                colorBgBase: "#05050a",
                borderRadius: 12,
                borderRadiusLG: 16,
                borderRadiusSM: 8,
                boxShadow: "0 8px 32px rgba(0, 212, 255, 0.15)",
                boxShadowSecondary: "0 4px 16px rgba(0, 212, 255, 0.1)",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
                fontSize: 14,
                fontSizeHeading1: 48,
                fontSizeHeading2: 36,
                fontSizeHeading3: 24,
                fontSizeHeading4: 18,
                fontSizeHeading5: 16,
                lineHeight: 1.6,
                motionDurationFast: "0.2s",
                motionDurationMid: "0.3s",
                motionDurationSlow: "0.4s",
              },
              components: {
                Layout: {
                  bodyBg: "transparent",
                  siderBg: "transparent",
                  headerBg: "transparent",
                },
                Menu: {
                  itemBg: "transparent",
                  itemSelectedBg: "rgba(0, 212, 255, 0.15)",
                  itemHoverBg: "rgba(0, 212, 255, 0.08)",
                  itemSelectedColor: "#00d4ff",
                  itemHoverColor: "#00e6ff",
                  itemBorderRadius: 8,
                },
                Card: {
                  colorBgContainer: "#0f0f1a",
                  colorBorderSecondary: "rgba(0, 212, 255, 0.2)",
                  borderRadiusLG: 16,
                },
                Button: {
                  primaryShadow: "0 4px 16px rgba(0, 212, 255, 0.25)",
                  primaryColor: "#0a0a0f",
                },
                Input: {
                  colorBgContainer: "#0f0f1a",
                  colorBorder: "rgba(0, 212, 255, 0.3)",
                  colorPrimaryHover: "#00d4ff",
                  borderRadius: 8,
                },
                Modal: {
                  contentBg: "#0f0f1a",
                  headerBg: "transparent",
                  footerBg: "transparent",
                },
                Tabs: {
                  itemActiveColor: "#00d4ff",
                  itemSelectedColor: "#00d4ff",
                  inkBarColor: "#00d4ff",
                  itemHoverColor: "#00e6ff",
                },
              },
            }}
          >
            <App>
              <Layout
                style={{
                  background: "transparent !important",
                  minHeight: "100vh",
                }}
              >
                <Layout className={styles.mainLayout}>
                  <Content className={styles.mainContent} style={{ padding: 0 }}>
                    {children}
                  </Content>
                </Layout>
              </Layout>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
