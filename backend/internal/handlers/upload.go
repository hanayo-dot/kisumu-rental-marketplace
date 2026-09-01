package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	UploadDir string
}

func NewUploadHandler(uploadDir string) *UploadHandler {
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	_ = os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{UploadDir: uploadDir}
}

// UploadImages handles single or multiple image uploads
func (h *UploadHandler) UploadImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid multipart form"})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		// Try single file under key "file"
		file, err := c.FormFile("file")
		if err == nil {
			files = append(files, file)
		}
	}

	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no image files provided"})
		return
	}

	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}

	var savedURLs []string

	for _, file := range files {
		// Enforce 10MB file limit
		if file.Size > 10*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("file %s exceeds max limit of 10MB", file.Filename)})
			return
		}

		ext := strings.ToLower(filepath.Ext(file.Filename))
		if !allowedExts[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("file type %s is not supported", ext)})
			return
		}

		randomBytes := make([]byte, 8)
		_, _ = rand.Read(randomBytes)
		uniqueName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), hex.EncodeToString(randomBytes), ext)

		dst := filepath.Join(h.UploadDir, uniqueName)
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image file"})
			return
		}

		savedURLs = append(savedURLs, "/uploads/"+uniqueName)
	}

	c.JSON(http.StatusOK, gin.H{
		"urls":    savedURLs,
		"url":     savedURLs[0],
		"message": "images uploaded successfully",
	})
}
