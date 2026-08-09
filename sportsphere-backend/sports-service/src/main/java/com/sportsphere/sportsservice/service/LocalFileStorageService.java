package com.sportsphere.sportsservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${app.baseUrl:http://localhost:8083}")
    private String baseUrl;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Local file storage initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the directory where the uploaded files will be stored.", ex);
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    /**
     * Saves the uploaded file to the local file system.
     * @return the local file name (serving as imageId)
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        
        // Generate a unique file name to avoid overwriting
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
        
        try {
            if (fileName.contains("..")) {
                throw new IOException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("Saved file locally: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            throw new IOException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    /**
     * Deletes the file from the local file system.
     */
    public void deleteFile(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return;
        }
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("Deleted local file: {}", fileName);
        } catch (IOException ex) {
            log.error("Failed to delete local file {}: {}", fileName, ex.getMessage());
        }
    }

    /**
     * Generates a public URL to access the file.
     * This assumes the Gateway routes /api/v1/sports to this service.
     * So we will serve it statically from this service at /uploads/{fileName}.
     * To be accessible from the frontend through the gateway, the URL should be /api/v1/sports/uploads/{fileName}.
     */
    public String getFileUrl(String fileName) {
        return "/api/v1/sports/uploads/" + fileName;
    }
}
