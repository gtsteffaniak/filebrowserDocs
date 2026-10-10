---
title: "Indexing Overview"
description: "Understanding FileBrowser Quantum's SQLite-based indexing system and scan strategies"
icon: "database"
date: "2026-01-19T19:30:07Z"
lastmod: "2026-08-24T17:05:51Z"
order: 3
---

## SQLite-Based Architecture

FileBrowser Quantum uses SQLite as its indexing backend. This brings several important improvements and considerations:

### Advantages

**Lower Memory Footprint**
- Memory usage is paged and managed by the operating system
- Out-of-memory errors related to index size are no longer a concern

**Enhanced Features**
- More detailed metadata can be indexed without memory concerns
- Enables advanced features like persistent folder sizes and preview detection
- Supports complex queries for search and filtering
- Powers **indexed-size storage quotas (v2.1.x)** (folder and scope limits that use folder size). For upload-only caps or indexing-disabled sources, use **tracked usage** instead — see {{< doclink path="features/quotas/" text="Storage quotas (v2.1.x)" />}}.

**Data Persistence**
- Index data persists between restarts by default
- No need to re-index your entire filesystem after a restart
- Scanner statistics and complexity information are preserved

### Trade-offs

- **CPU and I/O Intensive**: Indexing operations must write to disk rather than just memory
- **OS-Managed Memory**: Memory usage is controlled by SQLite driver and OS, not directly by the application

## Scan Strategies: Quick vs Full Scans

FileBrowser Quantum uses two distinct scanning strategies to balance thoroughness with performance:

### Scan Pattern

The indexer follows a **4+1 pattern**:
1. **Full Scan** (complete re-index)
2. Quick Scan
3. Quick Scan
4. Quick Scan
5. Quick Scan

Then the cycle repeats. This approach provides responsive updates for most changes while periodically performing comprehensive validation.

### Quick Scan (Modtime-Based)

Quick scans are designed for speed and efficiency by checking only directory modification times.

**What Quick Scans Can Detect:**
- New files or folders created
- Files or folders deleted
- Renaming of files or folders
- Directory structure changes

**What Quick Scans Cannot Detect:**
- File content changes when size remains the same
- Updates to existing files (e.g., editing a document and saving it)


Quick scans are **significantly faster** than full scans because they only check directory metadata instead of reading directory contents.

### Full Scan

Full scans perform a complete recursive walk of the filesystem and rebuild the index from scratch.

**What Full Scans Do:**
- Walk the entire directory tree recursively
- Read all directory contents
- Detect all file changes including size modifications
- Update all metadata (types, sizes, preview flags)
- Calculate directory sizes and complexity metrics
- Detect hardlinks to avoid double-counting

**Performance Expectations:**

The scan duration varies dramatically based on filesystem complexity:

| # Folders | # Files | Typical Time | Memory Usage |
|-----------|---------|--------------|--------------|
| 10,000 | 10,000 | 0-5 seconds | 50 MB |
| 2,000 | 250,000 | 0-5 seconds | 100 MB |
| 50,000 | 50,000 | 5-30 seconds | 150 MB |
| 250,000 | 10,000 | 2-5 minutes | 200 MB |
| 500,000 | 500,000 | 5+ minutes | 300 MB |

{{% alert context="warning" %}}
**Important:** File size changes (like editing and saving a document) will only be reflected after a full scan completes. Quick scans will not detect these changes.
{{% /alert %}}

## Smart Scanning Intervals

FileBrowser Quantum automatically adjusts scan frequency based on your filesystem's characteristics and change patterns.

### Adaptive Scheduling

The system uses a **complexity-based schedule** that ranges from 5 minutes to 12 hours between scans.

### Complexity Levels

The system calculates a complexity score (0-10) based on two factors:

**Scan Time Score:**
- < 2 seconds: Simple (1)
- 2-5 seconds: Light (2)
- 5-15 seconds: Normal-Light (3)
- 15-30 seconds: Normal (4)
- 30-60 seconds: Normal-Heavy (5)
- 60-90 seconds: Heavy-Light (6)
- 90-120 seconds: Heavy (7)
- 120-180 seconds: Very Heavy (8)
- 180-300 seconds: Extremely Heavy (9)
- 300+ seconds: Maximum Complexity (10)

**Directory Count Score:**
- < 2,500 dirs: Simple (1)
- 2,500-5,000: Light (2)
- 5,000-10,000: Normal-Light (3)
- 10,000-25,000: Normal (4)
- 25,000-50,000: Normal-Heavy (5)
- 50,000-100,000: Heavy-Light (6)
- 100,000-250,000: Heavy (7)
- 250,000-500,000: Very Heavy (8)
- 500,000-1M: Extremely Heavy (9)
- 1M+ dirs: Maximum Complexity (10)

Your filesystem's final complexity is the **higher of the two scores**.

### Dynamic Adjustment

The scan interval automatically adjusts based on activity:

**When Files Change:**
- Schedule moves to faster intervals (minimum: schedule index 3 = 40 minutes)
- Ensures active filesystems get frequent updates

**When Files Don't Change:**
- Schedule gradually increases to longer intervals
- Reduces CPU and I/O usage for stable filesystems

**Complexity Caps:**
- Simple filesystems (complexity 1) are capped at 1-hour intervals
- Prevents unnecessary scanning of small, stable directories

## Database Configuration

### Journal Modes

FileBrowser Quantum supports two SQLite journal modes:

{{< tabs tabTotal="2" >}}
{{< tab tabName="Default Mode (OFF)" >}}

**Characteristics:**
- Much lower I/O overhead
- Quicker for most use cases
- Immediate durability guarantees


This mode should be used for all scenarios unless you run into problems from increased scale of users or activity.

If you notice issues, you can try enabling WAL mode, but you should also raise a support issue on github since this generally should not be needed.

{{< /tab >}}
{{< tab tabName="WAL Mode" >}}

**For high-concurrency environments**

```yaml
server:
  indexSqlConfig:
    walMode: true
```

**Characteristics:**
- Better concurrency for large scale deployments.
- Much higher I/O usage.

**Trade-offs:**
- Creates additional `-wal` and `-shm` files
- More I/O operations for write-heavy workloads
- More likely to be corrupted and discarded on dirty shutdowns.

**Best for:**
- High-traffic file servers
- Frequent API access patterns
- Multiple concurrent users
- Enterprise environments

{{% alert context="info" %}}
**WAL Mode Details:** Write-Ahead Logging keeps changes in a separate log file, allowing readers to access the main database while writes occur. The system periodically checkpoints these changes back to the main file.
{{% /alert %}}

{{< /tab >}}
{{< /tabs >}}

### Batch Size Configuration

Control how many items are written to the database at once:

```yaml
server:
  indexSqlConfig:
    batchSize: 1000  # Default, adjust based on your needs
```

**Smaller Batch Sizes (100-500):**
- More frequent database writes
- Lower memory usage during scanning
- Better progress visibility
- Slightly slower overall indexing

**Larger Batch Sizes (1000-5000):**
- Fewer database writes
- Better bulk insert performance
- Higher memory usage during scanning
- Faster overall indexing

{{% alert context="success" %}}
**Recommendation:** The default batch size of 1000 is optimal for most scenarios. Only adjust if you're experiencing specific performance issues.
{{% /alert %}}

### Cache Size

Configure SQLite's memory cache:

```yaml
server:
  indexSqlConfig:
    cacheSizeMB: 10  # Default cache size in megabytes
```

- Higher cache = better query performance
- Lower cache = reduced memory usage
- The OS may cache additional data beyond this setting

## Manual Refresh

While automatic scanning keeps the index up-to-date, you can also trigger manual refreshes:

**API-Based Refresh:**
- Use the resources API GET method
- Refreshes the specific directory being accessed
- Bypasses the scan schedule for immediate updates

## Symbolic Links

FileBrowser Quantum does **not follow symbolic links** during indexing by default. This is a deliberate design decision for security and indexing stability.

### Why Symbolic Links Are Not Followed

**Security Concerns:**
- Symbolic links can point to locations outside the configured source path, potentially exposing files that should not be accessible
- This could allow path traversal attacks if symlinks are created through file uploads or other means

**Indexing Complexity:**
- Symbolic links can create circular references, causing infinite loops during indexing
- Index paths must be scoped to the source path, and out-of-scope symlinks break this requirement
- The indexing system needs to track all paths relative to the source root, which becomes impossible with external symlinks

### Current Behavior

**What Happens:**
- Symbolic links are detected but **not followed** during scanning
- Symlinks appear in the file listing but are treated as dead links (not traversed)
- The `ignoreSymlinks` rule option can be used to exclude symlinks from indexing entirely

**Excluding Symbolic Links:**

You can exclude symlinks from indexing using the `ignoreSymlinks` rule option. To exclude **all symlinks globally**, you must use a root-level rule with `folderPath: "/"`:

```yaml
server:
  sources:
    - path: "/data"
      config:
        rules:
          - folderPath: "/"
            ignoreSymlinks: true  # Exclude all symlinks globally
```

Or exclude symlinks for specific paths:

```yaml
server:
  sources:
    - path: "/data"
      config:
        rules:
          - folderPath: "/symlinks"
            ignoreSymlinks: true  # Exclude symlinks in this folder
```

### Planned Support

Future versions may support:

**In-Scope Symbolic Links:**
- Symlinks that point to locations within the same source path
- Example: `/data/folder1/link` → `/data/folder2/target` (both within `/data` source)

**Root Path Symbolic Links:**
- If the source path itself is a symlink, it will be resolved
- Example: source path `/symlink` → `/actual/path`

### Not Supported

**Out-of-Scope Symbolic Links:**
- Symlinks pointing outside the source path will **never** be supported
- Example: `/data/link` → `/other/path` (outside `/data` source)
- This restriction is necessary for security and indexing integrity

### Use Cases and Workarounds

**Common Use Cases:**
- Organizing files with symlinks to avoid duplication
- Creating shortcuts to frequently accessed directories
- Managing user home directories with symlinks

**Workarounds:**
- Use multiple sources instead of symlinks for different directories
- Configure the source path to include all directories you need (without symlinks)
- Use `includeRootItem` rules to show only specific subdirectories

{{% alert context="warning" %}}
**Important:** If you have symlinks in your filesystem, they will appear in FileBrowser but will not be traversed. Files and folders accessed through symlinks will not be indexed or searchable. Consider restructuring your filesystem or using multiple sources instead.
{{% /alert %}}

## Multi-Scanner Architecture

Each source creates multiple scanners -- one for each directory in the root of the source path.

**Child Scanners:**
- One scanner per top-level directory
- Recursive scans within their scope
- Run independently with serialized execution
- Automatically created/removed as directories appear/disappear

## Troubleshooting

### Index Taking Too Long

{{% alert context="info" %}}
The initial scan always takes the longest. Subsequent scans benefit from cached metadata and smart scanning.
{{% /alert %}}

**Solutions:**
1. Check the complexity score - high complexity is expected for large filesystems
2. Consider using `neverWatchPaths` to exclude large, static directories
3. Monitor system I/O - slow disks significantly impact scan times

### High Memory Usage

**SQLite manages its own memory:**
- Memory usage depends on cache size configuration
- The OS may show higher usage due to SQLite page cache
- This is normal and expected behavior

**To reduce memory usage:**
1. Lower `cacheSizeMB` in configuration
2. Reduce `batchSize` for smaller write buffers
3. The OS will automatically page memory if needed

### Database Corruption

SQLite databases are generally robust, but issues can occur. The status of the database is detected on startup and if the existing sqlite info is corrupted it will be discarded and a fresh database will be created.

## Next Steps

- {{< doclink path="configuration/sources/" text="Configure Sources" />}}
- {{< doclink path="getting-started/config/" text="Configuration Guide" />}}
