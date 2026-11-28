package com.vectorgallery.app

import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Intent
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileInputStream

class MainActivity : FlutterActivity() {
    private val channelName = "vectorgallery/files"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName).setMethodCallHandler { call, result ->
            when (call.method) {
                "saveToDownloads" -> {
                    val sourcePath = call.argument<String>("sourcePath")
                    val fileName = call.argument<String>("fileName") ?: "download"
                    val mimeType = call.argument<String>("mimeType") ?: "application/octet-stream"
                    if (sourcePath.isNullOrBlank()) {
                        result.error("INVALID_ARGS", "Missing sourcePath", null)
                        return@setMethodCallHandler
                    }
                    try {
                        val savedLocation = saveFileToDownloads(File(sourcePath), fileName, mimeType)
                        result.success(savedLocation)
                    } catch (e: Exception) {
                        result.error("SAVE_FAILED", e.message ?: "Failed to save to Downloads", null)
                    }
                }
                "openFile" -> {
                    val filePath = call.argument<String>("filePath")
                    val mimeType = call.argument<String>("mimeType") ?: "*/*"
                    if (filePath.isNullOrBlank()) {
                        result.error("INVALID_ARGS", "Missing filePath", null)
                        return@setMethodCallHandler
                    }
                    try {
                        val file = File(filePath)
                        val uri = FileProvider.getUriForFile(this, "${applicationContext.packageName}.fileprovider", file)
                        val intent = Intent(Intent.ACTION_VIEW).apply {
                            setDataAndType(uri, mimeType)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                        result.success(true)
                    } catch (_: ActivityNotFoundException) {
                        result.error("NO_APP", "No app installed on this phone can open this file type.", null)
                    } catch (e: Exception) {
                        result.error("OPEN_FAILED", e.message ?: "Unable to open file", null)
                    }
                }
                "shareFile" -> {
                    val filePath = call.argument<String>("filePath")
                    val mimeType = call.argument<String>("mimeType") ?: "*/*"
                    val title = call.argument<String>("title") ?: "Share file"
                    if (filePath.isNullOrBlank()) {
                        result.error("INVALID_ARGS", "Missing filePath", null)
                        return@setMethodCallHandler
                    }
                    try {
                        val file = File(filePath)
                        val uri = FileProvider.getUriForFile(this, "${applicationContext.packageName}.fileprovider", file)
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = mimeType
                            putExtra(Intent.EXTRA_STREAM, uri)
                            putExtra(Intent.EXTRA_SUBJECT, title)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        startActivity(Intent.createChooser(intent, title))
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("SHARE_FAILED", e.message ?: "Unable to share file", null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun saveFileToDownloads(source: File, fileName: String, mimeType: String): String {
        val safeName = fileName.replace(Regex("[\\\\/:*?\"<>|]"), "_").ifBlank { "vectorgallery_file" }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, safeName)
                put(MediaStore.Downloads.MIME_TYPE, mimeType)
                put(MediaStore.Downloads.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/VectorGallery")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val resolver = contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: throw IllegalStateException("Could not create Downloads entry")
            try {
                resolver.openOutputStream(uri)?.use { out ->
                    FileInputStream(source).use { input ->
                        input.copyTo(out)
                    }
                } ?: throw IllegalStateException("Could not open Downloads output stream")
                values.clear()
                values.put(MediaStore.Downloads.IS_PENDING, 0)
                resolver.update(uri, values, null, null)
                return "Downloads/VectorGallery/$safeName"
            } catch (e: Exception) {
                resolver.delete(uri, null, null)
                throw e
            }
        } else {
            @Suppress("DEPRECATION")
            val downloadsDir = File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "VectorGallery"
            )
            if (!downloadsDir.exists()) downloadsDir.mkdirs()
            val dest = File(downloadsDir, safeName)
            source.copyTo(dest, overwrite = true)
            return dest.absolutePath
        }
    }
}
