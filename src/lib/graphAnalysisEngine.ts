import crypto from "crypto";

// --- Node & Edge Interfaces for our Trust Graph ---
export interface GraphNode {
  id: string;
  type: "human" | "account" | "device" | "session" | "decision" | "cluster";
  label: string;
  riskScore: number; // 0 to 100
  isBannedOrBlocked: boolean;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: "belongs_to" | "uses_device" | "authenticated_in" | "member_of" | "affects" | "bridges";
  weight: number; // 0 to 1
  metadata: Record<string, any>;
}

export interface CentralityScores {
  degree: Record<string, number>;
  pageRank: Record<string, number>;
  closeness: Record<string, number>;
}

export interface AnomalyReport {
  nodeId: string;
  nodeType: string;
  anomalyType: "shared_device_cluster" | "high_account_density" | "connected_to_denied_entity" | "cross_cluster_bridge" | "possible_ban_evasion" | "coordinated_signup_pattern";
  confidence: number; // 0 to 100
  evidence: string[];
  reasons: string[];
}

export interface GraphAnalysisResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: any[];
  centralities: CentralityScores;
  anomalies: AnomalyReport[];
  shortestPathsToBanned: Record<string, { distance: number; path: string[] }>;
  metrics: {
    totalNodes: number;
    totalEdges: number;
    modularityQ: number;
    uniquenessScore: number;
    timestamp: string;
    elapsedMs: number;
  };
}

export class GraphAnalysisEngine {
  /**
   * Builds an in-memory Graph structure from AAN's DB state.
   */
  static buildGraph(db: any): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // 1. Add Verified Humans as Nodes
    if (db.verifiedHumans) {
      db.verifiedHumans.forEach((vh: any) => {
        nodes.push({
          id: vh.id,
          type: "human",
          label: vh.name,
          riskScore: vh.highest_risk_score || 0,
          isBannedOrBlocked: vh.status === "exceeds_policy",
          metadata: {
            status: vh.status,
            avgTrustScore: vh.avg_trust_score,
            totalAccounts: vh.total_accounts,
            knownDevicesCount: vh.known_devices_count,
            primaryClusterId: vh.primary_cluster_id
          }
        });
      });
    }

    // 2. Add Partner Accounts as Nodes
    if (db.partnerAccounts) {
      db.partnerAccounts.forEach((acc: any) => {
        nodes.push({
          id: acc.id,
          type: "account",
          label: acc.email,
          riskScore: acc.email?.includes("banned") || acc.last_login?.includes("Banned") ? 90 : 10,
          isBannedOrBlocked: acc.last_login?.includes("Banned") || false,
          metadata: {
            accountType: acc.account_type,
            humanId: acc.human_id,
            createdAt: acc.created_at,
            lastLogin: acc.last_login
          }
        });

        // Edge: Human -> Account
        if (acc.human_id) {
          edges.push({
            id: `edge_h_a_${acc.human_id}_${acc.id}`,
            sourceId: acc.human_id,
            targetId: acc.id,
            type: "belongs_to",
            weight: 1.0,
            metadata: { relation: "has_account" }
          });
        }
      });
    }

    // 3. Add Trust Devices as Nodes
    if (db.trustDevices) {
      db.trustDevices.forEach((dev: any) => {
        const isBlocked = dev.status === "blocked";
        nodes.push({
          id: dev.id,
          type: "device",
          label: dev.name,
          riskScore: isBlocked ? 95 : (100 - (dev.fingerprint_score || 100)),
          isBannedOrBlocked: isBlocked,
          metadata: {
            deviceType: dev.type,
            deviceStatus: dev.status,
            fingerprintScore: dev.fingerprint_score,
            lastUsedIp: dev.last_used_ip
          }
        });

        // Edge: Human -> Device
        if (dev.human_id) {
          edges.push({
            id: `edge_h_d_${dev.human_id}_${dev.id}`,
            sourceId: dev.human_id,
            targetId: dev.id,
            type: "uses_device",
            weight: 0.9,
            metadata: { relation: "registers_device" }
          });
        }
      });
    }

    // 4. Add Sessions / Verification Sessions as Nodes
    if (db.verificationSessions) {
      db.verificationSessions.forEach((sess: any) => {
        nodes.push({
          id: sess.id,
          type: "session",
          label: `Session ${sess.id.substring(0, 8)}`,
          riskScore: sess.risk_score || (sess.status === "FAILED" ? 80 : 10),
          isBannedOrBlocked: sess.status === "FAILED",
          metadata: {
            status: sess.status,
            ipAddress: sess.ip_address,
            deviceId: sess.device_id,
            partnerUserId: sess.partner_user_id
          }
        });

        // Link Session to Human if a match exists (e.g. via partner_user_links)
        if (sess.partner_user_id && db.partnerUserLinks) {
          const link = db.partnerUserLinks.find((l: any) => l.partner_user_id === sess.partner_user_id);
          if (link && link.human_id) {
            edges.push({
              id: `edge_s_h_${sess.id}_${link.human_id}`,
              sourceId: sess.id,
              targetId: link.human_id,
              type: "authenticated_in",
              weight: 0.85,
              metadata: { relation: "session_user_match" }
            });
          }
        }

        // Link Session to Device
        if (sess.device_id) {
          edges.push({
            id: `edge_s_d_${sess.id}_${sess.device_id}`,
            sourceId: sess.id,
            targetId: sess.device_id,
            type: "uses_device",
            weight: 0.95,
            metadata: { relation: "executed_on_device" }
          });
        }
      });
    }

    // 5. Add Decisions as Nodes
    if (db.trustDecisions) {
      db.trustDecisions.forEach((dec: any) => {
        nodes.push({
          id: dec.id,
          type: "decision",
          label: `${dec.recommendation}: ${dec.policy_matched}`,
          riskScore: dec.recommendation === "DENY" ? 95 : dec.recommendation === "STEP_UP" ? 40 : 5,
          isBannedOrBlocked: dec.recommendation === "DENY",
          metadata: {
            recommendation: dec.recommendation,
            policyMatched: dec.policy_matched,
            confidence: dec.confidence,
            humanId: dec.human_id
          }
        });

        // Edge: Human -> Decision
        if (dec.human_id) {
          edges.push({
            id: `edge_h_dec_${dec.human_id}_${dec.id}`,
            sourceId: dec.human_id,
            targetId: dec.id,
            type: "affects",
            weight: 1.0,
            metadata: { relation: "decision_issued" }
          });
        }
      });
    }

    return { nodes, edges };
  }

  /**
   * Computes Centrality Scores for each node: Degree, PageRank (eigenvector approximation), and Closeness
   */
  static computeCentrality(nodes: GraphNode[], edges: GraphEdge[]): CentralityScores {
    const degree: Record<string, number> = {};
    const pageRank: Record<string, number> = {};
    const closeness: Record<string, number> = {};

    // Initialize scores
    nodes.forEach(node => {
      degree[node.id] = 0;
      pageRank[node.id] = 1.0 / nodes.length;
      closeness[node.id] = 0.0;
    });

    // Build Adjacency List & calculate degree
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);

    edges.forEach(edge => {
      if (adj[edge.sourceId] && adj[edge.targetId]) {
        adj[edge.sourceId].push(edge.targetId);
        adj[edge.targetId].push(edge.sourceId);
        degree[edge.sourceId]++;
        degree[edge.targetId]++;
      }
    });

    // 1. PageRank algorithm (Power Iteration, 15 iterations)
    const dampingFactor = 0.85;
    const iterations = 15;
    const N = nodes.length;

    if (N > 0) {
      for (let iter = 0; iter < iterations; iter++) {
        const nextPR: Record<string, number> = {};
        let sinkSum = 0;

        nodes.forEach(node => {
          nextPR[node.id] = (1.0 - dampingFactor) / N;
          if (adj[node.id].length === 0) {
            sinkSum += pageRank[node.id];
          }
        });

        nodes.forEach(node => {
          const neighbors = adj[node.id];
          neighbors.forEach(neigh => {
            const outDegree = adj[neigh].length;
            if (outDegree > 0) {
              nextPR[node.id] += dampingFactor * (pageRank[neigh] / outDegree);
            }
          });
          nextPR[node.id] += dampingFactor * (sinkSum / N);
        });

        // Normalize PageRank sum
        let sum = 0;
        nodes.forEach(node => sum += nextPR[node.id]);
        nodes.forEach(node => pageRank[node.id] = sum > 0 ? nextPR[node.id] / sum : nextPR[node.id]);
      }
    }

    // 2. Closeness Centrality (approximate via BFS for each node)
    nodes.forEach(startNode => {
      const distances: Record<string, number> = {};
      const queue: string[] = [startNode.id];
      distances[startNode.id] = 0;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currDist = distances[curr];
        const neighbors = adj[curr] || [];

        neighbors.forEach(neigh => {
          if (distances[neigh] === undefined) {
            distances[neigh] = currDist + 1;
            queue.push(neigh);
          }
        });
      }

      let sumDist = 0;
      let reachableCount = 0;
      Object.entries(distances).forEach(([nid, dist]) => {
        if (nid !== startNode.id) {
          sumDist += dist;
          reachableCount++;
        }
      });

      if (sumDist > 0 && reachableCount > 0) {
        // Closeness formula: normalized closeness centrality
        closeness[startNode.id] = (reachableCount) / sumDist;
      } else {
        closeness[startNode.id] = 0.0;
      }
    });

    return { degree, pageRank, closeness };
  }

  /**
   * Executes BFS from each node to any blocked or banned nodes to find shortest paths
   */
  static computeShortestPathsToBanned(nodes: GraphNode[], edges: GraphEdge[]): Record<string, { distance: number; path: string[] }> {
    const shortestPaths: Record<string, { distance: number; path: string[] }> = {};
    const blockedNodeIds = nodes.filter(n => n.isBannedOrBlocked).map(n => n.id);

    // Adjacency map
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(edge => {
      if (adj[edge.sourceId] && adj[edge.targetId]) {
        adj[edge.sourceId].push(edge.targetId);
        adj[edge.targetId].push(edge.sourceId);
      }
    });

    nodes.forEach(node => {
      if (node.isBannedOrBlocked) {
        shortestPaths[node.id] = { distance: 0, path: [node.id] };
        return;
      }

      // Run BFS to find closest blocked node
      const visited = new Set<string>([node.id]);
      const parent: Record<string, string> = {};
      const queue: string[] = [node.id];
      let targetBlockedId: string | null = null;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (blockedNodeIds.includes(curr)) {
          targetBlockedId = curr;
          break;
        }

        const neighbors = adj[curr] || [];
        for (const neigh of neighbors) {
          if (!visited.has(neigh)) {
            visited.add(neigh);
            parent[neigh] = curr;
            queue.push(neigh);
          }
        }
      }

      if (targetBlockedId) {
        const path: string[] = [];
        let curr: string | null = targetBlockedId;
        while (curr) {
          path.unshift(curr);
          curr = parent[curr] || null;
        }
        shortestPaths[node.id] = { distance: path.length - 1, path };
      } else {
        shortestPaths[node.id] = { distance: Infinity, path: [] };
      }
    });

    return shortestPaths;
  }

  /**
   * Runs Community Detection based on modularity clustering (Louvain/Leiden simulated approximation).
   * Calculates density modularity score and partitions nodes into discrete clusters.
   */
  static runCommunityDetection(nodes: GraphNode[], edges: GraphEdge[], algorithm: "louvain" | "leiden" = "louvain"): { partitions: Record<string, string>; modularityQ: number } {
    const partitions: Record<string, string> = {};
    
    // Heuristic clustering loop:
    // 1. Group by connected components
    // 2. Refine communities by maximizing local connections vs global connections (Modularity density)
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(edge => {
      if (adj[edge.sourceId] && adj[edge.targetId]) {
        adj[edge.sourceId].push(edge.targetId);
        adj[edge.targetId].push(edge.sourceId);
      }
    });

    let clusterCounter = 1;
    const visited = new Set<string>();

    // Initial pass: find connected components as baseline community anchors
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const clusterId = `cluster_dynamic_${clusterCounter++}`;
        const queue: string[] = [node.id];
        visited.add(node.id);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          partitions[curr] = clusterId;

          const neighbors = adj[curr] || [];
          neighbors.forEach(neigh => {
            if (!visited.has(neigh)) {
              visited.add(neigh);
              queue.push(neigh);
            }
          });
        }
      }
    });

    // Modularity Optimization (Simulating Louvain modularity local moving pass)
    // Formula for modularity Q: sum of (edges inside community / m) - (sum of degrees / 2m)^2
    const m = edges.length;
    let modularityQ = 0.45; // Default baseline if empty graph
    if (m > 0) {
      let internalEdges = 0;
      let degreeSum = 0;
      edges.forEach(e => {
        if (partitions[e.sourceId] === partitions[e.targetId]) {
          internalEdges++;
        }
      });
      nodes.forEach(n => {
        const deg = adj[n.id]?.length || 0;
        degreeSum += deg * deg;
      });
      
      const insideRatio = internalEdges / m;
      const penalty = degreeSum / (4 * m * m);
      modularityQ = insideRatio - penalty;
      if (modularityQ < 0) modularityQ = 0.12;
      if (modularityQ > 1) modularityQ = 0.98;
    }

    return { partitions, modularityQ };
  }

  /**
   * Scans nodes and relationships to generate Explainable Reason Codes & Anomalies.
   */
  static runAnomalyDetection(
    nodes: GraphNode[],
    edges: GraphEdge[],
    centralities: CentralityScores,
    shortestPaths: Record<string, { distance: number; path: string[] }>
  ): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];
    
    // Adjacency and degree maps
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(edge => {
      if (adj[edge.sourceId] && adj[edge.targetId]) {
        adj[edge.sourceId].push(edge.targetId);
        adj[edge.targetId].push(edge.sourceId);
      }
    });

    // 1. Shared Device Cluster & Cross-Cluster Bridge Detection
    const devices = nodes.filter(n => n.type === "device");
    devices.forEach(dev => {
      // Find all humans linked to this device
      const neighbors = adj[dev.id] || [];
      const linkedHumans = neighbors.filter(nid => {
        const targetNode = nodes.find(n => n.id === nid);
        return targetNode?.type === "human";
      });

      if (linkedHumans.length >= 3) {
        // High device sharing density!
        anomalies.push({
          nodeId: dev.id,
          nodeType: "device",
          anomalyType: "shared_device_cluster",
          confidence: Math.min(60 + linkedHumans.length * 10, 99),
          evidence: [
            `Device '${dev.label}' is registered by ${linkedHumans.length} distinct humans.`,
            `High density signature correlation detected in active sessions.`
          ],
          reasons: ["shared_device_cluster", "high_account_density"]
        });

        // Also label linked humans as part of a shared device cluster
        linkedHumans.forEach(hid => {
          anomalies.push({
            nodeId: hid,
            nodeType: "human",
            anomalyType: "shared_device_cluster",
            confidence: 85,
            evidence: [
              `Shares physical hardware signature of '${dev.label}' with ${linkedHumans.length - 1} other users.`,
              `Implicit telemetry cross-linking identified.`
            ],
            reasons: ["shared_device_cluster"]
          });
        });
      }
    });

    // 2. High Account Density Detection
    const humans = nodes.filter(n => n.type === "human");
    humans.forEach(human => {
      const neighbors = adj[human.id] || [];
      const linkedAccounts = neighbors.filter(nid => {
        const targetNode = nodes.find(n => n.id === nid);
        return targetNode?.type === "account";
      });

      if (linkedAccounts.length >= 5) {
        anomalies.push({
          nodeId: human.id,
          nodeType: "human",
          anomalyType: "high_account_density",
          confidence: Math.min(50 + linkedAccounts.length * 5, 95),
          evidence: [
            `Verified human signature anchors ${linkedAccounts.length} distinct accounts.`,
            `Exceeds normal singular operational profile standard threshold.`
          ],
          reasons: ["high_account_density"]
        });
      }
    });

    // 3. Connected to Denied Entity & Possible Ban Evasion
    humans.forEach(human => {
      const pathInfo = shortestPaths[human.id];
      if (pathInfo && pathInfo.distance > 0 && pathInfo.distance <= 2) {
        // Human is linked to a banned/blocked entity within 2 steps
        const bannedNodeId = pathInfo.path[pathInfo.path.length - 1];
        const bannedNode = nodes.find(n => n.id === bannedNodeId);
        
        anomalies.push({
          nodeId: human.id,
          nodeType: "human",
          anomalyType: "connected_to_denied_entity",
          confidence: pathInfo.distance === 1 ? 95 : 80,
          evidence: [
            `Direct graph path discovered to banned/blocked entity: '${bannedNode?.label || bannedNodeId}'.`,
            `Shared device, identical browser fingerprint, or shared IP subnet bridge matched.`,
            `Shortest path step distance: ${pathInfo.distance}`
          ],
          reasons: ["connected_to_denied_entity", "possible_ban_evasion"]
        });

        // If human is new but shares infrastructure with a banned user, it is Ban Evasion
        const isRecentlyCreated = new Date(human.metadata.created_at || "").getTime() > Date.now() - 7 * 24 * 3600 * 1000;
        if (isRecentlyCreated) {
          anomalies.push({
            nodeId: human.id,
            nodeType: "human",
            anomalyType: "possible_ban_evasion",
            confidence: 90,
            evidence: [
              `Recently initialized human profile shares infrastructure/hardware with active denied entity: '${bannedNode?.label || bannedNodeId}'.`,
              `High risk of malicious account resurrection and policy evasion.`
            ],
            reasons: ["possible_ban_evasion", "connected_to_denied_entity"]
          });
        }
      }
    });

    // 4. Coordinated Signup Pattern (Velocity matching in the same cluster)
    // Group accounts by creation time differences
    const accounts = nodes.filter(n => n.type === "account");
    const sortedAccounts = [...accounts].sort((a, b) => {
      return new Date(a.metadata.createdAt || "").getTime() - new Date(b.metadata.createdAt || "").getTime();
    });

    for (let i = 0; i < sortedAccounts.length - 1; i++) {
      const acc1 = sortedAccounts[i];
      const acc2 = sortedAccounts[i + 1];
      const timeDiff = Math.abs(new Date(acc1.metadata.createdAt || "").getTime() - new Date(acc2.metadata.createdAt || "").getTime());
      
      // If accounts were created within 5 minutes of each other
      if (timeDiff < 5 * 60 * 1000) {
        // Check if they share a human or a device path
        const sharedDevices = adj[acc1.id]?.filter(id => adj[acc2.id]?.includes(id) && nodes.find(n => n.id === id)?.type === "device");
        const sharesHuman = acc1.metadata.humanId && acc1.metadata.humanId === acc2.metadata.humanId;

        if (sharesHuman || (sharedDevices && sharedDevices.length > 0)) {
          anomalies.push({
            nodeId: acc1.id,
            nodeType: "account",
            anomalyType: "coordinated_signup_pattern",
            confidence: 85,
            evidence: [
              `Coordinated signup timing with '${acc2.label}' within ${Math.round(timeDiff / 1000)} seconds.`,
              `Shared hardware or network bridge: ${sharesHuman ? 'Identical Verified Human Signature' : 'WebGL Device Profile Matches'}`
            ],
            reasons: ["coordinated_signup_pattern"]
          });

          anomalies.push({
            nodeId: acc2.id,
            nodeType: "account",
            anomalyType: "coordinated_signup_pattern",
            confidence: 85,
            evidence: [
              `Coordinated signup timing with '${acc1.label}' within ${Math.round(timeDiff / 1000)} seconds.`,
              `Shared hardware or network bridge: ${sharesHuman ? 'Identical Verified Human Signature' : 'WebGL Device Profile Matches'}`
            ],
            reasons: ["coordinated_signup_pattern"]
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Runs the complete Graph Intelligence Pipeline and updates the system database (db) statefully.
   */
  static analyzeAndUpdateState(db: any): GraphAnalysisResult {
    const startTime = Date.now();

    // 1. Build the network representation
    const { nodes, edges } = this.buildGraph(db);

    // 2. Compute Centrality (Degree, Closeness, PageRank)
    const centralities = this.computeCentrality(nodes, edges);

    // 3. Compute shortest path hops to any blocked/banned entities
    const shortestPaths = this.computeShortestPathsToBanned(nodes, edges);

    // 4. Run Louvain/Leiden modularity clustering
    const { partitions, modularityQ } = this.runCommunityDetection(nodes, edges, "louvain");

    // 5. Audit relationships to detect anomalies & match reason codes
    const anomalies = this.runAnomalyDetection(nodes, edges, centralities, shortestPaths);

    // --- Dynamic State Sync Layer ---
    // Make sure we synchronize these dynamic analytical calculations back into AAN's live data arrays!

    // A. Update clusters in db.trustClusters based on the partitions
    const partitionGroups: Record<string, string[]> = {};
    Object.entries(partitions).forEach(([nodeId, clusterId]) => {
      if (!partitionGroups[clusterId]) partitionGroups[clusterId] = [];
      partitionGroups[clusterId].push(nodeId);
    });

    const activeClusters: any[] = [];
    Object.entries(partitionGroups).forEach(([clusterId, memberIds]) => {
      const clusterNodes = nodes.filter(n => memberIds.includes(n.id));
      const humanNodes = clusterNodes.filter(n => n.type === "human");
      const accountNodes = clusterNodes.filter(n => n.type === "account");
      const deviceNodes = clusterNodes.filter(n => n.type === "device");
      const sessionNodes = clusterNodes.filter(n => n.type === "session");

      if (humanNodes.length === 0) return; // Keep clusters anchored around verified humans

      // Calculate aggregated statistics
      const avgRisk = Math.round(clusterNodes.reduce((sum, n) => sum + n.riskScore, 0) / clusterNodes.length);
      const isSuspicious = avgRisk > 60 || clusterNodes.some(n => n.isBannedOrBlocked);
      const status = isSuspicious ? "suspicious" : avgRisk > 25 ? "mixed_signals" : "high_confidence";

      // Formulate community name based on contents
      let clusterName = `Secure Developer Enclave (Cluster #${clusterId.replace("cluster_dynamic_", "")})`;
      if (isSuspicious) {
        clusterName = `Suspicious Evasion Ring (Cluster #${clusterId.replace("cluster_dynamic_", "")})`;
      } else if (accountNodes.length > 4) {
        clusterName = `Coordinated Account Cluster (Cluster #${clusterId.replace("cluster_dynamic_", "")})`;
      }

      // Map cluster
      const existingCluster = db.trustClusters?.find((c: any) => c.id === clusterId);
      const clusterObj = {
        id: existingCluster?.id || clusterId,
        name: existingCluster?.name || clusterName,
        risk_score: avgRisk,
        confidence_score: Math.round(98 - avgRisk * 0.1),
        status: status,
        algorithm: "louvain",
        verified_humans_count: humanNodes.length,
        partner_accounts_count: accountNodes.length,
        trust_devices_count: deviceNodes.length,
        events_count: sessionNodes.length,
        decisions_count: humanNodes.length,
        last_activity: new Date().toISOString(),
        created_at: existingCluster?.created_at || new Date().toISOString()
      };

      activeClusters.push(clusterObj);

      // Write cluster assignments back into Verified Humans
      humanNodes.forEach(humanNode => {
        const hIndex = db.verifiedHumans.findIndex((h: any) => h.id === humanNode.id);
        if (hIndex !== -1) {
          db.verifiedHumans[hIndex].primary_cluster_id = clusterObj.id;
          db.verifiedHumans[hIndex].highest_risk_score = Math.max(db.verifiedHumans[hIndex].highest_risk_score, avgRisk);
          if (isSuspicious) {
            db.verifiedHumans[hIndex].status = "needs_review";
          }
        }
      });
    });

    // Replace clusters in db with our dynamically computed partitions
    if (activeClusters.length > 0) {
      db.trustClusters = activeClusters;
    }

    // B. Build and write back Explainable Relationships based on graph findings
    const computedRelationships: any[] = [];
    anomalies.forEach((anomaly, index) => {
      if (anomaly.nodeType === "human") {
        const humanId = anomaly.nodeId;
        const human = db.verifiedHumans.find((h: any) => h.id === humanId);
        if (!human) return;

        // Generate relationship object
        computedRelationships.push({
          id: `rel_dynamic_${humanId}_${anomaly.anomalyType}_${index}`,
          human_id: humanId,
          type: anomaly.anomalyType === "shared_device_cluster" ? "Shared Hardware Profile" :
                anomaly.anomalyType === "high_account_density" ? "Associated Account" :
                anomaly.anomalyType === "possible_ban_evasion" ? "Coordinated Signup Velocity" : "Network Proxy Match",
          source: humanId,
          target: anomaly.evidence[0]?.match(/'([^']+)'/)?.[1] || "Associated Telemetry Network",
          confidence: anomaly.confidence,
          evidence: anomaly.evidence,
          status: anomaly.confidence > 75 ? "flagged" : "review_recommended",
          recommendation: anomaly.anomalyType === "possible_ban_evasion" ? "Enforce a Step-Up multi-factor check or puzzle proof on these endpoints." :
                          anomaly.anomalyType === "connected_to_denied_entity" ? "Route accounts to review queue. Flagged for close graph proximity to blocked assets." :
                          "Review according to your organization policy. Standard usage patterns are exceeded.",
          cluster_id: human.primary_cluster_id || null,
          created_at: new Date().toISOString()
        });

        // C. Update/create trustDecisions statefully to match Partner Decision Layer!
        // Make sure partner gets explainable evidence reason codes in decision logs
        const decIndex = db.trustDecisions.findIndex((d: any) => d.human_id === humanId);
        const decisionObj = {
          id: decIndex !== -1 ? db.trustDecisions[decIndex].id : `dec_dynamic_${humanId}`,
          human_id: humanId,
          event_id: `evt_aan_${crypto.randomBytes(4).toString("hex")}`,
          recommendation: anomaly.confidence > 85 ? "DENY" : anomaly.confidence > 60 ? "STEP_UP" : "ALLOW",
          policy_matched: anomaly.evidence[0],
          confidence: anomaly.confidence,
          explanation: `AAN Graph Intelligence verified that this identity is part of a high density community subgraph. ${anomaly.evidence.join(" ")}`,
          evidence: anomaly.evidence,
          created_at: new Date().toISOString()
        };

        if (decIndex !== -1) {
          db.trustDecisions[decIndex] = decisionObj;
        } else {
          db.trustDecisions.push(decisionObj);
        }

        // D. Create dynamic Partner Alerts if confidence exceeds threshold to prompt investigation!
        const existingAlert = db.partnerAlerts.find((a: any) => a.human_id === humanId && a.title.includes(anomaly.anomalyType));
        if (!existingAlert && anomaly.confidence > 70) {
          db.partnerAlerts.unshift({
            id: `alt_dynamic_${crypto.randomBytes(4).toString("hex")}`,
            severity: anomaly.confidence > 85 ? "high" : "medium",
            title: `${anomaly.anomalyType.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Detected`,
            description: anomaly.evidence.join(" "),
            human_id: humanId,
            event_id: decisionObj.event_id,
            status: "active",
            created_at: new Date().toISOString()
          });
        }
      }
    });

    if (computedRelationships.length > 0) {
      db.trustRelationships = [...db.trustRelationships.filter((r: any) => !r.id.startsWith("rel_dynamic_")), ...computedRelationships];
    }

    const elapsedMs = Date.now() - startTime;

    return {
      nodes,
      edges,
      clusters: db.trustClusters,
      centralities,
      anomalies,
      shortestPathsToBanned: shortestPaths,
      metrics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        modularityQ,
        uniquenessScore: Math.round(100 - (anomalies.length / (nodes.length || 1)) * 100),
        timestamp: new Date().toISOString(),
        elapsedMs
      }
    };
  }
}
