FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["sportsphere-notification-service.csproj", "./"]
RUN dotnet restore "sportsphere-notification-service.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "sportsphere-notification-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "sportsphere-notification-service.dll"]
